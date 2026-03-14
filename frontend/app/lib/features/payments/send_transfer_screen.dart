import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/utils/api_config.dart';

class SendTransferScreen extends ConsumerStatefulWidget {
  final String? userId;
  final String? amount;

  const SendTransferScreen({super.key, this.userId, this.amount});

  @override
  ConsumerState<SendTransferScreen> createState() => _SendTransferScreenState();
}

class _SendTransferScreenState extends ConsumerState<SendTransferScreen> {
  late final TextEditingController _userIdController;
  late final TextEditingController _amountController;
  final TextEditingController _noteController = TextEditingController();

  bool _isInitiating = false;
  bool _isClaiming = false;
  String? _upiLink;
  int? _transferId;

  @override
  void initState() {
    super.initState();
    _userIdController = TextEditingController(text: widget.userId);
    _amountController = TextEditingController(text: widget.amount);
    if (widget.userId != null) {
      _noteController.text = 'Settlement payment';
    }
  }

  @override
  void dispose() {
    _userIdController.dispose();
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _handleInitiate() async {
    if (_userIdController.text.isEmpty || _amountController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter User ID and Amount')),
      );
      return;
    }

    setState(() => _isInitiating = true);
    final api = ref.read(apiServiceProvider);

    try {
      final response = await api.post(ApiConfig.initiateTransfer, {
        'toUserId': int.parse(_userIdController.text),
        'amount': double.parse(_amountController.text),
        'note': _noteController.text,
      });

      if (mounted) {
        final decoded = jsonDecode(response.body);
        if (response.statusCode == 200 && decoded['success'] == true) {
          setState(() {
            _upiLink = decoded['data']['upiLink'];
            _transferId = decoded['data']['transferId'];
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content:
                  Text(decoded['message'] ?? 'Failed to initiate transfer'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isInitiating = false);
    }
  }

  Future<void> _handleClaim() async {
    if (_transferId == null) return;

    setState(() => _isClaiming = true);
    final api = ref.read(apiServiceProvider);

    try {
      final response = await api.post(
        '${ApiConfig.baseUrl}/transfers/$_transferId/claim',
        {},
      );
      if (mounted) {
        final decoded = jsonDecode(response.body);
        if (response.statusCode == 200 && decoded['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Payment claim submitted!'),
              backgroundColor: Color(0xFF00C896),
            ),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content:
                  Text(decoded['message'] ?? 'Failed to claim payment'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isClaiming = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final amountDisplay = _amountController.text.isNotEmpty
        ? '₹${double.tryParse(_amountController.text)?.toStringAsFixed(2) ?? _amountController.text}'
        : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Send Money')),
      backgroundColor: const Color(0xFFF2F7F5),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Amount hero (when prefilled from settle) ───────────────
            if (amountDisplay != null && widget.amount != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0A0A),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PAYING',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white.withValues(alpha: 0.40),
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      amountDisplay,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 46,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF00C896),
                        letterSpacing: -2,
                      ),
                    ),
                    if (_noteController.text.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        _noteController.text,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withValues(alpha: 0.45),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // ── Input fields ───────────────────────────────────────────
            _buildInput(
              label: 'RECEIVER USER ID',
              controller: _userIdController,
              icon: LucideIcons.hash,
              keyboardType: TextInputType.number,
              enabled: widget.userId == null,
            ),
            const SizedBox(height: 16),
            _buildInput(
              label: 'AMOUNT',
              controller: _amountController,
              icon: LucideIcons.indianRupee,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              enabled: widget.amount == null,
            ),
            const SizedBox(height: 16),
            _buildInput(
              label: 'NOTE',
              controller: _noteController,
              icon: LucideIcons.fileText,
              hint: "What's this for?",
            ),
            const SizedBox(height: 28),

            // ── Action area ────────────────────────────────────────────
            if (_upiLink == null)
              ElevatedButton(
                onPressed: _isInitiating ? null : _handleInitiate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C896),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                ),
                child: _isInitiating
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Initiate Transfer'),
                          SizedBox(width: 8),
                          Icon(LucideIcons.arrowRight, size: 18),
                        ],
                      ),
              )
            else
              _TransferReadyPanel(
                upiLink: _upiLink!,
                isClaiming: _isClaiming,
                onOpenUpi: () => launchUrl(Uri.parse(_upiLink!)),
                onClaim: _handleClaim,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInput({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    String? hint,
    TextInputType? keyboardType,
    bool enabled = true,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: Color(0xFF888888),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          enabled: enabled,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, size: 18, color: const Color(0xFF888888)),
            filled: true,
            fillColor: enabled ? Colors.white : const Color(0xFFF0F4F2),
          ),
        ),
      ],
    );
  }
}

class _TransferReadyPanel extends StatelessWidget {
  final String upiLink;
  final bool isClaiming;
  final VoidCallback onOpenUpi;
  final VoidCallback onClaim;

  const _TransferReadyPanel({
    required this.upiLink,
    required this.isClaiming,
    required this.onOpenUpi,
    required this.onClaim,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFF00C896).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  LucideIcons.checkCircle,
                  color: Color(0xFF00C896),
                  size: 18,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Transfer Ready',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.3,
                    ),
                  ),
                  Text(
                    'Complete payment via UPI',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.45),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: onOpenUpi,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.15),
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.externalLink,
                    size: 16,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Open UPI App',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: isClaiming ? null : onClaim,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF00C896),
                borderRadius: BorderRadius.circular(12),
              ),
              child: isClaiming
                  ? const Center(
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          LucideIcons.checkCircle,
                          size: 16,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'I Have Sent Payment',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
