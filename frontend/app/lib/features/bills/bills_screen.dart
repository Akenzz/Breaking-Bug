import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class BillsScreen extends StatelessWidget {
  const BillsScreen({super.key});

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
            Container(
              height: 240,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey.shade200, width: 2),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
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
                    'Drop your bills here or browse',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'JPEG, PNG, BMP, WebP up to 10MB',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            const Text(
              'Recent Scans',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 2,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                return _BillScanItem(
                  merchant: index == 0 ? 'Navratna Veg Treat' : 'Nwkrtc',
                  date: '10 Mar 2026',
                  amount: index == 0 ? '₹78.57' : '₹47.75',
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

  const _BillScanItem({required this.merchant, required this.date, required this.amount});

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
        subtitle: Text(date, style: const TextStyle(fontSize: 12)),
        trailing: Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00C896))),
      ),
    );
  }
}
