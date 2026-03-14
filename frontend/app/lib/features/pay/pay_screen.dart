import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/models/app_models.dart';

class PayScreen extends ConsumerStatefulWidget {
  const PayScreen({super.key});

  @override
  ConsumerState<PayScreen> createState() => _PayScreenState();
}

class _PayScreenState extends ConsumerState<PayScreen> {
  bool _isProcessing = false;
  final TextEditingController _upiIdController = TextEditingController();

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing) return;

    final String? code = capture.barcodes.first.rawValue;
    debugPrint("QR Code Detected: $code");

    if (code != null && code.startsWith('upi://pay')) {
      _processUpiUri(code);
    } else {
      debugPrint("Ignoring non-UPI QR code");
    }
  }

  void _processUpiUri(String uriString) async {
    debugPrint("Processing UPI URI: $uriString");
    setState(() {
      _isProcessing = true;
    });

    try {
      final uri = Uri.parse(uriString);
      final params = uri.queryParameters;
      debugPrint("Parsed Parameters: $params");

      final String pa = params['pa'] ?? '';
      final String pn = params['pn'] ?? 'Recipient';
      final String am = params['am'] ?? '';

      if (pa.isEmpty) {
        debugPrint("Error: VPA (pa) is missing in QR code");
        _showError('Invalid UPI QR Code: Recipient VPA missing', vpa: null);
        return;
      }

      if (am.isEmpty) {
        debugPrint("Amount (am) missing, prompting user...");
        _promptForAmount(uriString, pa, pn);
      } else {
        debugPrint("Amount found: $am. Launching UPI app...");
        _launchUpiApp(uriString, pa, pn, double.parse(am));
      }
    } catch (e) {
      debugPrint("Error parsing UPI URI: $e");
      _showError('Failed to parse UPI details: $e', vpa: null);
    }
  }

  void _promptForAmount(String originalUri, String pa, String pn) {
    final TextEditingController amountController = TextEditingController();
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text('Pay to $pn'),
        content: TextField(
          controller: amountController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            hintText: 'Enter amount',
            prefixText: '₹ ',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() => _isProcessing = false);
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final amount = double.tryParse(amountController.text);
              if (amount != null && amount > 0) {
                Navigator.pop(context);
                final newUri = Uri.parse(originalUri)
                    .replace(
                      queryParameters: {
                        ...Uri.parse(originalUri).queryParameters,
                        'am': amount.toString(),
                      },
                    )
                    .toString();
                _launchUpiApp(newUri, pa, pn, amount);
              }
            },
            child: const Text('Pay'),
          ),
        ],
      ),
    );
  }

  /// Returns true if payment should proceed, false if blocked/cancelled.
  Future<bool> _evaluateRisk(String pn, double amount) async {
    final api = ref.read(apiServiceProvider);
    final transactions = ref.read(transactionsProvider).value ?? [];
    final now = DateTime.now();

    final previousConnections = transactions
        .where((t) => t.toUserName == pn)
        .length;

    final sevenDaysAgo = now.subtract(const Duration(days: 7));
    final recentOutgoing = transactions.where((t) {
      if (t.createdAt == null) return false;
      final date = DateTime.tryParse(t.createdAt!);
      return date != null && date.isAfter(sevenDaysAgo);
    }).toList();
    final avg7d = recentOutgoing.isEmpty
        ? amount
        : recentOutgoing.map((t) => t.amount).reduce((a, b) => a + b) /
              recentOutgoing.length;

    // For the demo, we use some semi-realistic mock values for receiver stats
    // because the QR code doesn't provide these directly.
    // In production, the backend would fetch these based on the UPI ID.
    final receiverAccountAge = pn.toLowerCase().contains('store') ? 500 : 15;
    final receiverReportCount = pn.toLowerCase().contains('kenzz')
        ? 0
        : (previousConnections > 0 ? 0 : 2);
    final receiverTxCount24h = pn.toLowerCase().contains('store') ? 150 : 25;
    final receiverUniqueSenders24h = pn.toLowerCase().contains('store')
        ? 120
        : 20;

    try {
      final response = await api.evaluateRisk({
        'amount': amount,
        'hour_of_day': now.hour,
        'is_weekend':
            (now.weekday == DateTime.saturday || now.weekday == DateTime.sunday)
            ? 1
            : 0,
        'receiver_account_age_days': receiverAccountAge,
        'receiver_report_count': receiverReportCount,
        'receiver_tx_count_24h': receiverTxCount24h,
        'receiver_unique_senders_24h': receiverUniqueSenders24h,
        'previous_connections_count': previousConnections,
        'avg_transaction_amount_7d': avg7d,
      });

      if (response.statusCode != 200) {
        debugPrint(
          'Risk evaluation failed with status: ${response.statusCode}',
        );
        return true;
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final riskResult = FraudRiskResponse.fromJson(data);

      if (!mounted) return false;

      return await _showRiskAnalysisModal(pn, amount, riskResult);
    } catch (e) {
      debugPrint('Risk evaluation error (failing open): $e');
    }
    return true;
  }

  Future<bool> _showRiskAnalysisModal(
    String pn,
    double amount,
    FraudRiskResponse risk,
  ) async {
    return await showModalBottomSheet<bool>(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) {
            final bottomPad = MediaQuery.of(context).padding.bottom;
            return Container(
              height: MediaQuery.of(context).size.height * 0.90,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Fixed: drag handle + risk header ──
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.grey.shade300,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: _getRiskColor(
                                  risk.riskLevel,
                                ).withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                risk.isBlocked
                                    ? LucideIcons.shieldAlert
                                    : LucideIcons.shieldCheck,
                                color: _getRiskColor(risk.riskLevel),
                                size: 32,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'AI Risk Analysis',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    'Risk Level: ${risk.riskLevel}',
                                    style: TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      color: _getRiskColor(risk.riskLevel),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                'Score: ${(risk.fraudRiskScore * 100).toStringAsFixed(0)}%',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                      ],
                    ),
                  ),

                  // ── Scrollable body ──
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            risk.isBlocked
                                ? 'Transaction Blocked'
                                : 'Analysis Results',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: risk.isBlocked
                                  ? Colors.red.shade50
                                  : Colors.green.shade50,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: risk.isBlocked
                                    ? Colors.red.shade100
                                    : Colors.green.shade100,
                              ),
                            ),
                            child: Text(
                              risk.message,
                              style: TextStyle(
                                color: risk.isBlocked
                                    ? Colors.red.shade800
                                    : Colors.green.shade800,
                                fontSize: 14,
                                height: 1.5,
                              ),
                            ),
                          ),
                          if (risk.riskReasons.isNotEmpty) ...[
                            const SizedBox(height: 28),
                            const Text(
                              'Top Risk Reasons',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            ...risk.riskReasons.map(
                              (reason) => Padding(
                                padding: const EdgeInsets.only(bottom: 10.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.only(top: 2),
                                      child: Icon(
                                        LucideIcons.alertTriangle,
                                        size: 16,
                                        color: _getRiskColor(risk.riskLevel),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        reason,
                                        style: const TextStyle(fontSize: 14),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                          if (risk.explanation != null &&
                              risk.explanation!.isNotEmpty) ...[
                            const SizedBox(height: 28),
                            const Text(
                              'Model Features Impact',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: risk.explanation!.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final exp = risk.explanation![index];
                                final isPositive = exp.impact > 0;
                                return Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            _formatFeatureName(exp.feature),
                                            style: const TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          Text(
                                            'Value: ${exp.value}',
                                            style: TextStyle(
                                              fontSize: 11,
                                              color: Colors.grey.shade600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      width: 60,
                                      alignment: Alignment.centerRight,
                                      child: Text(
                                        '${isPositive ? '+' : ''}${exp.impact.toStringAsFixed(2)}',
                                        style: TextStyle(
                                          color: isPositive
                                              ? Colors.red
                                              : Colors.green,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),
                          ],
                          const SizedBox(height: 8),
                        ],
                      ),
                    ),
                  ),

                  // ── Pinned action buttons ──
                  Padding(
                    padding: EdgeInsets.fromLTRB(24, 8, 24, bottomPad + 16),
                    child: risk.isBlocked
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              ElevatedButton(
                                onPressed: () => Navigator.pop(context, false),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.black,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 16,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: const Text('Back to Safety'),
                              ),
                              const SizedBox(height: 10),
                              OutlinedButton(
                                onPressed: () => Navigator.pop(context, true),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.red),
                                  foregroundColor: Colors.red,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 16,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: const Text(
                                  'Pay Anyway (I acknowledge the risk)',
                                ),
                              ),
                            ],
                          )
                        : Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () =>
                                      Navigator.pop(context, false),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 16,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                  ),
                                  child: const Text(
                                    'Cancel Payment',
                                    style: TextStyle(color: Colors.red),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => Navigator.pop(context, true),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF00C896),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 16,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                  ),
                                  child: const Text('Proceed to Pay'),
                                ),
                              ),
                            ],
                          ),
                  ),
                ],
              ),
            );
          },
        ) ??
        false;
  }

  Color _getRiskColor(String level) {
    switch (level.toUpperCase()) {
      case 'SAFE':
        return const Color(0xFF00C896);
      case 'LOW':
        return Colors.blue;
      case 'MEDIUM':
        return Colors.orange;
      case 'HIGH':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _formatFeatureName(String name) {
    return name
        .replaceAll('_', ' ')
        .split(' ')
        .map((s) => s[0].toUpperCase() + s.substring(1))
        .join(' ');
  }

  Future<void> _launchUpiApp(
    String uriString,
    String pa,
    String pn,
    double amount,
  ) async {
    final canProceed = await _evaluateRisk(pn, amount);
    if (!canProceed) {
      setState(() => _isProcessing = false);
      return;
    }

    final Uri uri = Uri.parse(uriString);
    debugPrint("Final UPI URI attempted: $uriString");

    try {
      final canLaunch = await canLaunchUrl(uri);
      debugPrint("canLaunchUrl result: $canLaunch");

      bool launched = false;
      if (canLaunch) {
        debugPrint("Invoking external application (canLaunch=true)...");
        launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        debugPrint(
          "canLaunchUrl was false, but attempting direct launch anyway...",
        );
        launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      }

      debugPrint("Launch status: $launched");

      if (launched) {
        if (mounted) {
          _showPostPaymentDialog(pa, pn, amount);
        }
      } else {
        debugPrint("Error: System failed to launch the UPI URI.");
        _showError(
          'Payment app failed to open. Many apps have limits on automated payments.',
          vpa: pa,
        );
      }
    } catch (e) {
      debugPrint("Fatal error launching UPI app: $e");
      _showError('Could not launch UPI app: $e', vpa: pa);
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _showPostPaymentDialog(String pa, String pn, double amount) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Payment'),
        content: Text('Did you complete the payment of ₹$amount to $pn?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No / Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _syncPaymentWithBackend(pa, pn, amount);
            },
            child: const Text('Yes, Sync Payment'),
          ),
        ],
      ),
    );
  }

  Future<void> _syncPaymentWithBackend(
    String pa,
    String pn,
    double amount,
  ) async {
    final api = ref.read(apiServiceProvider);
    try {
      final response = await api.recordPayment({
        'transactionId': 'UPI-${DateTime.now().millisecondsSinceEpoch}',
        'amount': amount,
        'receiverVpa': pa,
        'receiverName': pn,
        'status': 'SUCCESS',
        'timestamp': DateTime.now().toIso8601String(),
      });

      if (mounted) {
        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Payment recorded successfully!'),
              backgroundColor: Color(0xFF00C896),
            ),
          );
        } else {
          _showError('Failed to record payment on server.', vpa: pa);
        }
      }
    } catch (e) {
      _showError('Error syncing with backend: $e', vpa: pa);
    }
  }

  void _showError(String message, {String? vpa}) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 5),
          action: vpa != null
              ? SnackBarAction(
                  label: 'COPY VPA',
                  textColor: Colors.white,
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: vpa));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('UPI ID copied to clipboard!'),
                      ),
                    );
                  },
                )
              : null,
        ),
      );
      setState(() => _isProcessing = false);
    }
  }

  @override
  void dispose() {
    _upiIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: const Text('Scan QR Code'),
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                MobileScanner(onDetect: _onDetect),
                Container(
                  width: 240,
                  height: 240,
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: const Color(0xFF00C896),
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
                if (_isProcessing)
                  const Center(
                    child: CircularProgressIndicator(color: Color(0xFF00C896)),
                  ),
                const Positioned(
                  bottom: 80,
                  child: Text(
                    'Align QR code within frame',
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(24, 32, 24, 40),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Or pay via UPI ID',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _upiIdController,
                  decoration: InputDecoration(
                    hintText: 'Enter UPI ID (e.g. name@bank)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    suffixIcon: IconButton(
                      icon: const Icon(
                        LucideIcons.arrowRight,
                        color: Color(0xFF00C896),
                      ),
                      onPressed: () {
                        if (_upiIdController.text.isNotEmpty) {
                          _processUpiUri(
                            'upi://pay?pa=${_upiIdController.text}',
                          );
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _ActionIcon(icon: LucideIcons.image, label: 'Gallery'),
                    const SizedBox(width: 40),
                    _ActionIcon(icon: LucideIcons.flashlight, label: 'Flash'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionIcon extends StatelessWidget {
  final IconData icon;
  final String label;

  const _ActionIcon({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 24),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
