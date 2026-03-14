import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/utils/api_config.dart';

class PendingConfirmationsScreen extends ConsumerWidget {
  const PendingConfirmationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final transfersAsync = ref.watch(pendingTransfersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pending Confirmations'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () => ref.invalidate(pendingTransfersProvider),
          ),
        ],
      ),
      body: transfersAsync.when(
        data: (transfers) {
          if (transfers.isEmpty) {
            return const Center(child: Text('No pending confirmations'));
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${transfers.length} awaiting confirmation',
                  style: const TextStyle(color: Colors.grey, fontSize: 14),
                ),
                const SizedBox(height: 24),
                ...transfers.map((item) => Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(item['fromUserName'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text('₹${item['amount']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00C896))),
                          ],
                        ),
                        if (item['note'] != null && item['note'].isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Text(item['note'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ),
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () async {
                                  final api = ref.read(apiServiceProvider);
                                  await api.post('${ApiConfig.baseUrl}/transfers/${item['transferId']}/confirm', {});
                                  ref.invalidate(pendingTransfersProvider);
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF00C896),
                                  minimumSize: const Size(0, 48),
                                ),
                                child: const Text('Confirm'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () async {
                                  final api = ref.read(apiServiceProvider);
                                  await api.post('${ApiConfig.baseUrl}/transfers/${item['transferId']}/dispute', {});
                                  ref.invalidate(pendingTransfersProvider);
                                },
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.red,
                                  side: const BorderSide(color: Colors.red),
                                  minimumSize: const Size(0, 48),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('Dispute'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                )),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
