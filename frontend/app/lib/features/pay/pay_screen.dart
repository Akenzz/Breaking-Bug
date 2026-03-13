import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';

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
                final newUri = Uri.parse(originalUri).replace(
                  queryParameters: {
                    ...Uri.parse(originalUri).queryParameters,
                    'am': amount.toString(),
                  }
                ).toString();
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

    try {
      final response = await api.evaluateRisk({
        'amount': amount,
        'hour_of_day': now.hour,
        'is_weekend':
            (now.weekday == DateTime.saturday || now.weekday == DateTime.sunday)
                ? 1
                : 0,
        'receiver_account_age_days': 0,
        'receiver_report_count': 0,
        'receiver_tx_count_24h': 0,
        'receiver_unique_senders_24h': 0,
        'previous_connections_count': previousConnections,
        'avg_transaction_amount_7d': avg7d,
      });

      if (response.statusCode != 200) return true;

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final riskScore = (data['fraud_risk_score'] as num).toDouble();
      final isBlocked = data['is_blocked'] as bool;
      final riskLevel = data['risk_level'] as String;
      final message = data['message'] as String;
      final riskReasons = List<String>.from(data['risk_reasons'] ?? []);

      if (!mounted) return false;

      if (isBlocked) {
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Row(children: [
              Icon(Icons.block, color: Colors.red),
              SizedBox(width: 8),
              Text('Payment Blocked'),
            ]),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Risk Score: ${(riskScore * 100).toStringAsFixed(0)}%',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, color: Colors.red),
                ),
                const SizedBox(height: 8),
                Text(message),
                if (riskReasons.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  ...riskReasons.map((r) =>
                      Text('• $r', style: const TextStyle(fontSize: 12))),
                ],
              ],
            ),
            actions: [
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('OK'),
              ),
            ],
          ),
        );
        return false;
      }

      if (riskLevel == 'HIGH' || riskLevel == 'MEDIUM') {
        final proceed = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                title: Row(children: [
                  Icon(Icons.warning_amber,
                      color: riskLevel == 'HIGH'
                          ? Colors.deepOrange
                          : Colors.orange),
                  const SizedBox(width: 8),
                  const Text('Suspicious Transaction'),
                ]),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Risk: $riskLevel (${(riskScore * 100).toStringAsFixed(0)}%)',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: riskLevel == 'HIGH'
                            ? Colors.deepOrange
                            : Colors.orange,
                      ),
                    ),
                    if (riskReasons.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      ...riskReasons.map((r) =>
                          Text('• $r', style: const TextStyle(fontSize: 12))),
                    ],
                    const SizedBox(height: 12),
                    const Text('Do you still want to proceed?'),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx, false),
                    child: const Text('Cancel',
                        style: TextStyle(color: Colors.red)),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    child: const Text('Proceed Anyway'),
                  ),
                ],
              ),
            ) ??
            false;
        return proceed;
      }
    } catch (e) {
      debugPrint('Risk evaluation error (failing open): $e');
    }
    return true;
  }

  Future<void> _launchUpiApp(String uriString, String pa, String pn, double amount) async {
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
        debugPrint("canLaunchUrl was false, but attempting direct launch anyway...");
        launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      }

      debugPrint("Launch status: $launched");
      
      if (launched) {
        if (mounted) {
          _showPostPaymentDialog(pa, pn, amount);
        }
      } else {
        debugPrint("Error: System failed to launch the UPI URI.");
        _showError('Payment app failed to open. Many apps have limits on automated payments.', vpa: pa);
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

  Future<void> _syncPaymentWithBackend(String pa, String pn, double amount) async {
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
            const SnackBar(content: Text('Payment recorded successfully!'), backgroundColor: Color(0xFF00C896)),
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
          action: vpa != null ? SnackBarAction(
            label: 'COPY VPA',
            textColor: Colors.white,
            onPressed: () {
              Clipboard.setData(ClipboardData(text: vpa));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('UPI ID copied to clipboard!')),
              );
            },
          ) : null,
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
                MobileScanner(
                  onDetect: _onDetect,
                ),
                Container(
                  width: 240,
                  height: 240,
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF00C896), width: 2),
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
                if (_isProcessing)
                  const Center(child: CircularProgressIndicator(color: Color(0xFF00C896))),
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
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    suffixIcon: IconButton(
                      icon: const Icon(LucideIcons.arrowRight, color: Color(0xFF00C896)),
                      onPressed: () {
                        if (_upiIdController.text.isNotEmpty) {
                          _processUpiUri('upi://pay?pa=${_upiIdController.text}');
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
