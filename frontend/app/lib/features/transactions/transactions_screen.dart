import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/models/app_models.dart';

class TransactionsScreen extends ConsumerWidget {
  const TransactionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final transactionsAsync = ref.watch(transactionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search by description, person, or type…',
                prefixIcon: const Icon(LucideIcons.search, size: 20),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          const _TransactionSummary(),
          Expanded(
            child: transactionsAsync.when(
              data: (transactions) {
                if (transactions.isEmpty) {
                  return const Center(child: Text('No transactions yet'));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: transactions.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    return _TransactionItem(transaction: transactions[index]);
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, s) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}

class _TransactionSummary extends ConsumerWidget {
  const _TransactionSummary();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final transactionsAsync = ref.watch(transactionsProvider);

    return transactionsAsync.when(
      data: (transactions) {
        double paid = 0;
        double received = 0;
        for (var tx in transactions) {
          if (tx.type == 'EXPENSE') {
            paid += tx.amount;
          } else {
            received += tx.amount;
          }
        }

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: Colors.grey.shade50,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _SummaryItem(label: 'Total Records', value: '${transactions.length}'),
              _SummaryItem(label: 'You Paid', value: '₹${paid.toStringAsFixed(2)}', color: Colors.red),
              _SummaryItem(label: 'You Received', value: '₹${received.toStringAsFixed(2)}', color: const Color(0xFF00C896)),
            ],
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (e, s) => const SizedBox.shrink(),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const _SummaryItem({required this.label, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}

class _TransactionItem extends StatelessWidget {
  final Transaction transaction;
  const _TransactionItem({required this.transaction});

  @override
  Widget build(BuildContext context) {
    final isExpense = transaction.type == 'EXPENSE';

    return Card(
      child: ListTile(
        title: Text(transaction.description, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('${transaction.perspective == "SPENT" ? "To" : "From"} ${transaction.fromUserName ?? "Unknown"} · ${transaction.createdAt ?? ""}', style: const TextStyle(fontSize: 12)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${isExpense ? "−" : "+"}₹${transaction.amount.toStringAsFixed(2)}',
              style: TextStyle(
                fontWeight: FontWeight.bold, 
                color: isExpense ? Colors.red : const Color(0xFF00C896),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: (isExpense ? Colors.red : const Color(0xFF00C896)).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                transaction.type, 
                style: TextStyle(
                  fontSize: 8, 
                  color: isExpense ? Colors.red : const Color(0xFF00C896), 
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
