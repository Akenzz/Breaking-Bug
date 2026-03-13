import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/utils/api_config.dart';
import 'package:smartpay/shared/models/app_models.dart';

class BillsScreen extends ConsumerStatefulWidget {
  const BillsScreen({super.key});

  @override
  ConsumerState<BillsScreen> createState() => _BillsScreenState();
}

class _BillsScreenState extends ConsumerState<BillsScreen> {
  bool _isUploading = false;
  final List<ParsedBill> _recentScans = [];

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 85,
    );

    if (image == null) return;

    setState(() {
      _isUploading = true;
    });

    try {
      final api = ref.read(apiServiceProvider);
      final response = await api.postMultipart(ApiConfig.parseBills, File(image.path));
      
      if (response.statusCode == 200) {
        final responseData = await response.stream.bytesToString();
        final decoded = jsonDecode(responseData);
        
        if (decoded['success'] == true) {
          final parsedBill = ParsedBill.fromJson(decoded['data']);
          setState(() {
            _recentScans.insert(0, parsedBill);
          });
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Successfully parsed bill from ${parsedBill.merchant}')),
            );
          }
        } else {
          throw Exception(decoded['error'] ?? 'Failed to parse bill');
        }
      } else {
        throw Exception('Server returned ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Bills'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'AI-powered expense organizer',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 32),
            GestureDetector(
              onTap: _isUploading ? null : _pickAndUploadImage,
              child: Container(
                height: 240,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _isUploading ? const Color(0xFF00C896) : Colors.grey.shade200, 
                    width: 2
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_isUploading)
                      const CircularProgressIndicator(color: Color(0xFF00C896))
                    else ...[
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00C896).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.uploadCloud, color: Color(0xFF00C896), size: 40),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Tap to upload a bill',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'JPEG, PNG, BMP, WebP up to 10MB',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                      ),
                    ]
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
            const Text(
              'Recent Scans',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_recentScans.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Text('No recent scans. Upload a bill to see results.', style: TextStyle(color: Colors.grey)),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _recentScans.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final bill = _recentScans[index];
                  return _BillScanItem(
                    merchant: bill.merchant,
                    date: bill.date,
                    amount: '${bill.currency} ${bill.total.toStringAsFixed(2)}',
                    category: bill.category,
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}

class _BillScanItem extends StatelessWidget {
  final String merchant;
  final String date;
  final String amount;
  final String category;

  const _BillScanItem({
    required this.merchant, 
    required this.date, 
    required this.amount,
    required this.category,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(LucideIcons.fileText, size: 20),
        ),
        title: Text(merchant, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('$date · $category', style: const TextStyle(fontSize: 12)),
        trailing: Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00C896))),
      ),
    );
  }
}
