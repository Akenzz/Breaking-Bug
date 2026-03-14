import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class PaymentsHubScreen extends StatelessWidget {
  const PaymentsHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payments'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Manage your requests & history',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 24),
            _PaymentNavCard(
              title: 'Send Money',
              description: 'Transfer funds instantly to any user',
              icon: LucideIcons.send,
              route: '/transfers/send',
            ),
            const SizedBox(height: 16),
            _PaymentNavCard(
              title: 'Payment Requests',
              description: 'Confirm or dispute incoming transfers',
              icon: LucideIcons.bellRing,
              route: '/transfers/pending',
            ),
            const SizedBox(height: 16),
            _PaymentNavCard(
              title: 'Recent Payments',
              description: 'View your full transfer history',
              icon: LucideIcons.history,
              route: '/transfers/history',
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentNavCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final String? count;
  final String route;

  const _PaymentNavCard({
    required this.title,
    required this.description,
    required this.icon,
    this.count,
    required this.route,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: () => context.push(route),
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF00C896).withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFF00C896)),
        ),
        title: Row(
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            if (count != null) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  count!,
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
        subtitle: Text(description, style: const TextStyle(fontSize: 12)),
        trailing: const Icon(LucideIcons.chevronRight, size: 20),
      ),
    );
  }
}
