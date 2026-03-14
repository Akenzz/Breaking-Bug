import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
      _noteController.text = "Settlement payment";
    }
  }

  Future<void> _handleInitiate() async {
    if (_userIdController.text.isEmpty || _amountController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter User ID and Amount')));
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
            SnackBar(content: Text(decoded['message'] ?? 'Failed to initiate transfer')),
          );
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isInitiating = false);
    }
  }

  Future<void> _handleClaim() async {
    if (_transferId == null) return;

    setState(() => _isClaiming = true);
    final api = ref.read(apiServiceProvider);

    try {
      final response = await api.post('${ApiConfig.baseUrl}/transfers/$_transferId/claim', {});
      if (mounted) {
        final decoded = jsonDecode(response.body);
        if (response.statusCode == 200 && decoded['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Payment claim submitted!'), backgroundColor: Color(0xFF00C896)),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(decoded['message'] ?? 'Failed to claim payment')),
          );
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isClaiming = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Send Money'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Transfer funds instantly',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 32),
            _buildInput(
              label: 'RECEIVER USER ID',
              controller: _userIdController,
              icon: LucideIcons.hash,
              keyboardType: TextInputType.number,
              enabled: widget.userId == null,
            ),
            const SizedBox(height: 20),
            _buildInput(
              label: 'AMOUNT',
              controller: _amountController,
              icon: LucideIcons.indianRupee,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              enabled: widget.amount == null,
            ),
            const SizedBox(height: 20),
            _buildInput(
              label: 'NOTE',
              controller: _noteController,
              icon: LucideIcons.fileText,
              hint: 'What\'s this for?',
            ),
            const SizedBox(height: 32),
            if (_upiLink == null)
              ElevatedButton(
                onPressed: _isInitiating ? null : _handleInitiate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C896),
                ),
                child: _isInitiating 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Initiate Transfer'),
              )
            else ...[
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF00C896).withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF00C896).withValues(alpha: 0.2)),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Transfer Ready',
                      style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00C896), fontSize: 12),
                    ),
                    const SizedBox(height: 16),
                    OutlinedButton.icon(
                      onPressed: () => launchUrl(Uri.parse(_upiLink!)),
                      icon: const Icon(LucideIcons.externalLink, size: 16),
                      label: const Text('Open UPI App'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 50),
                        side: const BorderSide(color: Color(0xFF00C896)),
                        foregroundColor: const Color(0xFF00C896),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _isClaiming ? null : _handleClaim,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00C896),
                        minimumSize: const Size(double.infinity, 50),
                      ),
                      child: _isClaiming
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('I Have Sent Payment'),
                    ),
                  ],
                ),
              ),
            ],
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
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          enabled: enabled,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, size: 18),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            filled: !enabled,
            fillColor: enabled ? null : Colors.grey.shade100,
          ),
        ),
      ],
    );
  }
}
