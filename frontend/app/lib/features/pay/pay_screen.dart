import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/models/app_models.dart';

class PayeeInfo {
  final String pa;
  final String pn;
  final String am;
  final String cu;
  final String rawLink;

  PayeeInfo({
    required this.pa,
    required this.pn,
    required this.am,
    required this.cu,
    required this.rawLink,
  });
}

class PayScreen extends ConsumerStatefulWidget {
  const PayScreen({super.key});

  @override
  ConsumerState<PayScreen> createState() => _PayScreenState();
}

class _PayScreenState extends ConsumerState<PayScreen> {
  bool _isProcessing = false;
  final TextEditingController _upiIdController = TextEditingController();
  PayeeInfo? _payee;
  FraudRiskResponse? _riskCheck;
  bool _isCheckingRisk = false;
  String? _riskError;

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing || _payee != null) return;

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

      final info = PayeeInfo(
        pa: pa,
        pn: pn,
        am: am,
        cu: params['cu'] ?? 'INR',
        rawLink: uriString,
      );

      setState(() {
        _payee = info;
        _isProcessing = false;
      });

      _promptForAmount(info);
    } catch (e) {
      debugPrint("Error parsing UPI URI: $e");
      _showError('Failed to parse UPI details: $e', vpa: null);
    }
  }

  Future<void> _runRiskCheck(PayeeInfo info, double? amount) async {
    setState(() {
      _isCheckingRisk = true;
      _riskError = null;
      _riskCheck = null;
    });

    try {
      final risk = await _evaluateRisk(info.pa, amount);
      if (mounted) {
        setState(() {
          _riskCheck = risk;
          _isCheckingRisk = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _riskError = "Unable to evaluate recipient risk right now.";
          _isCheckingRisk = false;
        });
      }
    }
  }

  void _promptForAmount(PayeeInfo info) {
    final TextEditingController amountController = TextEditingController(
      text: info.am.isNotEmpty ? info.am : '',
    );
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text('Pay to ${info.pn}'),
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
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final amount = double.tryParse(amountController.text);
              if (amount != null && amount > 0) {
                Navigator.pop(context);
                final updatedInfo = PayeeInfo(
                  pa: info.pa,
                  pn: info.pn,
                  am: amount.toString(),
                  cu: info.cu,
                  rawLink: Uri.parse(info.rawLink)
                      .replace(
                        queryParameters: {
                          ...Uri.parse(info.rawLink).queryParameters,
                          'am': amount.toString(),
                        },
                      )
                      .toString(),
                );
                setState(() => _payee = updatedInfo);
                _runRiskCheck(updatedInfo, amount);
              }
            },
            child: const Text('Confirm Amount'),
          ),
        ],
      ),
    );
  }

  Future<FraudRiskResponse?> _evaluateRisk(String pa, double? amount) async {
    final api = ref.read(apiServiceProvider);

    final body = <String, dynamic>{'receiverUpiId': pa};
    if (amount != null) body['amount'] = amount;

    final response = await api.evaluateRisk(body);

    if (response.statusCode != 200) {
      throw Exception('Risk evaluation failed');
    }

    final envelope = jsonDecode(response.body) as Map<String, dynamic>;
    final data = envelope['data'] as Map<String, dynamic>;
    return FraudRiskResponse.fromJson(data);
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

  Future<void> _handlePay() async {
    final info = _payee;
    if (info == null || _isCheckingRisk) return;

    if (info.am.isEmpty) {
      _promptForAmount(info);
      return;
    }

    final amount = double.parse(info.am);

    if (_riskCheck?.isBlocked == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Payment is blocked due to high fraud risk.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    _launchUpiApp(info.rawLink, info.pa, info.pn, amount);
  }

  Future<void> _launchUpiApp(String uriString, String pa, String pn, double amount) async {
    setState(() => _isProcessing = true);
    final Uri uri = Uri.parse(uriString);

    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);

      if (launched) {
        if (mounted) {
          _showPostPaymentDialog(pa, pn, amount);
        }
      } else {
        _showError('Payment app failed to open.', vpa: pa);
      }
    } catch (e) {
      _showError('Could not launch UPI app: $e', vpa: pa);
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _handleRescan() {
    setState(() {
      _payee = null;
      _riskCheck = null;
      _isCheckingRisk = false;
      _riskError = null;
    });
  }

  void _showPostPaymentDialog(String pa, String pn, double amount) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Payment'),
        content: Text('Did you complete the payment of ₹$amount to $pn?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('No')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _syncPaymentWithBackend(pa, pn, amount);
            },
            child: const Text('Yes, Sync'),
          ),
        ],
      ),
    );
  }

  Future<void> _syncPaymentWithBackend(String pa, String pn, double amount) async {
    final api = ref.read(apiServiceProvider);
    try {
      await api.recordPayment({
        'transactionId': 'UPI-${DateTime.now().millisecondsSinceEpoch}',
        'amount': amount,
        'receiverVpa': pa,
        'receiverName': pn,
        'status': 'SUCCESS',
        'timestamp': DateTime.now().toIso8601String(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment recorded!'), backgroundColor: Color(0xFF00C896)),
        );
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
          action: vpa != null
              ? SnackBarAction(
                  label: 'COPY VPA',
                  textColor: Colors.white,
                  onPressed: () => Clipboard.setData(ClipboardData(text: vpa)),
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
    final isBlocked = _riskCheck?.isBlocked ?? false;
    final hasFraudWarning = _riskCheck != null && _riskCheck!.riskLevel != "SAFE";

    return Scaffold(
      backgroundColor: _payee == null ? Colors.black : const Color(0xFFF2F7F5),
      appBar: AppBar(
        backgroundColor: _payee == null ? Colors.transparent : Colors.white,
        foregroundColor: _payee == null ? Colors.white : Colors.black,
        elevation: 0,
        title: Text(_payee == null ? 'Scan QR Code' : 'Payment Details'),
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () {
            if (_payee != null) {
              _handleRescan();
            } else {
              Navigator.pop(context);
            }
          },
        ),
      ),
      body: _payee == null ? _buildScanner() : _buildResultView(isBlocked, hasFraudWarning),
    );
  }

  Widget _buildScanner() {
    return Column(
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
                  border: Border.all(color: const Color(0xFF00C896), width: 2),
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              if (_isProcessing) const Center(child: CircularProgressIndicator(color: Color(0xFF00C896))),
              const Positioned(
                bottom: 80,
                child: Text('Align QR code within frame', style: TextStyle(color: Colors.white, fontSize: 14)),
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
              const Text('Or pay via UPI ID', style: TextStyle(fontWeight: FontWeight.bold)),
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
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _ActionIcon(icon: LucideIcons.image, label: 'Gallery'),
                  SizedBox(width: 40),
                  _ActionIcon(icon: LucideIcons.flashlight, label: 'Flash'),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildResultView(bool isBlocked, bool hasFraudWarning) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: const Color(0xFF00C896).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(LucideIcons.zap, color: Color(0xFF00C896), size: 32),
                  ),
                  const SizedBox(height: 16),
                  const Text('Payment Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  _DetailRow(icon: LucideIcons.user, label: 'Payee Name', value: _payee!.pn),
                  const SizedBox(height: 16),
                  _DetailRow(icon: LucideIcons.wallet, label: 'UPI ID', value: _payee!.pa, isMono: true),
                  if (_payee!.am.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    _DetailRow(
                      icon: LucideIcons.indianRupee,
                      label: 'Amount',
                      value: '₹ ${double.parse(_payee!.am).toStringAsFixed(2)}',
                      isAmount: true,
                    ),
                  ],
                  const SizedBox(height: 24),
                  if (_isCheckingRisk)
                    const _RiskCard(
                      type: 'info',
                      icon: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                      title: 'Checking recipient safety…',
                      text: "We're verifying fraud signals for this UPI ID before payment.",
                    )
                  else if (_riskCheck != null)
                    _RiskCard(
                      type: isBlocked ? 'danger' : hasFraudWarning ? 'warn' : 'safe',
                      icon: Icon(
                        isBlocked
                            ? LucideIcons.shieldAlert
                            : hasFraudWarning
                                ? LucideIcons.alertTriangle
                                : LucideIcons.shieldCheck,
                        size: 20,
                      ),
                      title: isBlocked
                          ? 'Recipient blocked'
                          : hasFraudWarning
                              ? 'Fraud warning • ${_riskCheck!.riskLevel}'
                              : 'Recipient looks safe',
                      score: 'Score ${_riskCheck!.fraudRiskScore.toStringAsFixed(4)}',
                      text: _riskCheck!.message,
                      reasons: _riskCheck!.riskReasons,
                    )
                  else if (_riskError != null)
                    _RiskCard(
                      type: 'warn',
                      icon: const Icon(LucideIcons.alertTriangle, size: 20),
                      title: 'Risk check unavailable',
                      text: _riskError!,
                    ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: _isCheckingRisk || isBlocked ? null : _handlePay,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 60),
                      backgroundColor: const Color(0xFF00C896),
                      disabledBackgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: _isCheckingRisk
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(LucideIcons.indianRupee, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                isBlocked
                                    ? 'Payment Blocked'
                                    : hasFraudWarning
                                        ? 'Proceed Anyway'
                                        : 'Pay Now',
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                  ),
                  const SizedBox(height: 16),
                  TextButton.icon(
                    onPressed: _handleRescan,
                    icon: const Icon(LucideIcons.rotateCcw, size: 16),
                    label: const Text('Scan Another QR'),
                    style: TextButton.styleFrom(foregroundColor: Colors.grey),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'You\'ll be redirected to your UPI app (PhonePe / Google Pay / Paytm) to complete the payment.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isMono;
  final bool isAmount;

  const _DetailRow({required this.icon, required this.label, required this.value, this.isMono = false, this.isAmount = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isAmount ? const Color(0xFF00C896).withOpacity(0.05) : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isAmount ? const Color(0xFF00C896).withOpacity(0.2) : Colors.grey.shade100),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: isAmount ? const Color(0xFF00C896) : Colors.grey),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade500, letterSpacing: 1)),
                const SizedBox(height: 4),
                Text(value, style: TextStyle(fontSize: isAmount ? 20 : 14, fontWeight: FontWeight.bold, fontFamily: isMono ? 'monospace' : null, color: isAmount ? const Color(0xFF00C896) : Colors.black)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RiskCard extends StatelessWidget {
  final String type;
  final Widget icon;
  final String title;
  final String? score;
  final String text;
  final List<String> reasons;

  const _RiskCard({required this.type, required this.icon, required this.title, this.score, required this.text, this.reasons = const []});

  double? _parseScore() {
    if (score == null) return null;
    final match = RegExp(r'\d+\.?\d*').firstMatch(score!);
    if (match == null) return null;
    return double.tryParse(match.group(0) ?? '');
  }

  @override
  Widget build(BuildContext context) {
    final Color accentColor;
    final Color bgColor;
    final Color textColor;
    final String verdictLabel;

    switch (type) {
      case 'safe':
        accentColor = const Color(0xFF00C896);
        bgColor = const Color(0xFFF0FDF9);
        textColor = const Color(0xFF065F46);
        verdictLabel = 'SAFE';
        break;
      case 'warn':
        accentColor = const Color(0xFFF97316);
        bgColor = const Color(0xFFFFF7ED);
        textColor = const Color(0xFF7C2D12);
        verdictLabel = 'WARNING';
        break;
      case 'danger':
        accentColor = const Color(0xFFDC2626);
        bgColor = const Color(0xFFFEF2F2);
        textColor = const Color(0xFF7F1D1D);
        verdictLabel = 'BLOCKED';
        break;
      default:
        accentColor = const Color(0xFF6366F1);
        bgColor = const Color(0xFFF5F3FF);
        textColor = const Color(0xFF3730A3);
        verdictLabel = 'VERIFYING';
    }

    final scoreValue = _parseScore();

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: accentColor.withOpacity(0.25), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: accentColor.withOpacity(0.10),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Verdict header ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 16, 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        verdictLabel,
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: accentColor,
                          letterSpacing: 3.5,
                          height: 1.0,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textColor.withOpacity(0.85),
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: IconTheme(
                    data: IconThemeData(color: accentColor, size: 26),
                    child: icon,
                  ),
                ),
              ],
            ),
          ),

          // ── Risk score bar ──────────────────────────────────────────
          if (scoreValue != null) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 4),
              child: Row(
                children: [
                  Text(
                    'RISK SCORE',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: textColor.withOpacity(0.45),
                      letterSpacing: 1.8,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: LinearProgressIndicator(
                        value: scoreValue.clamp(0.0, 1.0),
                        minHeight: 5,
                        backgroundColor: accentColor.withOpacity(0.12),
                        valueColor: AlwaysStoppedAnimation<Color>(accentColor),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    scoreValue.toStringAsFixed(4),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: accentColor,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // ── Message & reasons footer ─────────────────────────────────
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: accentColor.withOpacity(0.07),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  text,
                  style: TextStyle(
                    fontSize: 13,
                    color: textColor.withOpacity(0.8),
                    height: 1.55,
                  ),
                ),
                if (reasons.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  ...reasons.map((r) => Padding(
                        padding: const EdgeInsets.only(top: 7),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(top: 5.5),
                              child: Container(
                                width: 5,
                                height: 5,
                                decoration: BoxDecoration(color: accentColor, shape: BoxShape.circle),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                r,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: textColor.withOpacity(0.75),
                                  height: 1.45,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
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
        Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.grey.shade100, shape: BoxShape.circle), child: Icon(icon, size: 24)),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
