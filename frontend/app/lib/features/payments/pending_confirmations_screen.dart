import 'package:flutter/material.dart';

class PendingConfirmationsScreen extends StatelessWidget {
  const PendingConfirmationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final pendingItems = [
      {'desc': 'Lunch payment', 'amount': '₹100'},
      {'desc': 'sumna', 'amount': '₹1,000'},
      {'desc': 'Dodge Challenger 1979', 'amount': '₹15,000,000'},
      {'desc': 'chumma', 'amount': '₹20'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pending Confirmations'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '5 awaiting confirmation',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 24),
            ...pendingItems.map((item) => Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(item['desc']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(item['amount']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF00C896))),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {},
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
                            onPressed: () {},
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
      ),
    );
  }
}
