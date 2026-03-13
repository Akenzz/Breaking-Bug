import 'package:flutter/material.dart';

class TransferHistoryScreen extends StatelessWidget {
  const TransferHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final transfers = [
      {'from': 'Sudhanva Kulkarni', 'to': 'beru', 'memo': 'idk', 'amount': '₹10', 'status': 'PENDING_CONFIRMATION'},
      {'from': 'Sudhanva Kulkarni', 'to': 'beru', 'memo': 'chumma', 'amount': '₹20', 'status': 'PENDING_CONFIRMATION'},
      {'from': 'Sudhanva Kulkarni', 'to': 'beru', 'memo': 'Dodge Challenger 1979', 'amount': '₹15,000,000', 'status': 'PENDING_CONFIRMATION'},
      {'from': 'Sudhanva Kulkarni', 'to': 'beru', 'memo': 'yak gotilla', 'amount': '₹2,000', 'status': 'INITIATED'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transfer History'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '6 transfers found',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 24),
            ...transfers.map((item) => Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                title: Text('${item['from']} → ${item['to']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Memo: ${item['memo']}', style: const TextStyle(fontSize: 12)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getStatusColor(item['status']!).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        item['status']!,
                        style: TextStyle(fontSize: 10, color: _getStatusColor(item['status']!), fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                trailing: Text(
                  item['amount']!,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return Colors.orange;
      case 'INITIATED':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}
