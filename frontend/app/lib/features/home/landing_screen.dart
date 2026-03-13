import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 80),
            // Hero Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00C896).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'STRUCTURED · SMART · SECURE',
                      style: TextStyle(
                        color: Color(0xFF00C896),
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Intelligent Expense\nSettlement\nPowered by AI',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      height: 1.1,
                      letterSpacing: -1,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'SmartPay transforms fragmented spending into structured assets using a high-fidelity AI core designed for precision settlement.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 40),
                  ElevatedButton(
                    onPressed: () => context.push('/signup'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      minimumSize: const Size(double.infinity, 60),
                    ),
                    child: const Text('Get Started'),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: () => context.push('/login'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 60),
                      side: const BorderSide(color: Colors.black),
                    ),
                    child: const Text('Sign In', style: TextStyle(color: Colors.black)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 60),
            // Features Grid
            const _FeaturesSection(),
            const SizedBox(height: 60),
            // Footer
            Container(
              padding: const EdgeInsets.all(40),
              color: Colors.grey.shade50,
              width: double.infinity,
              child: Column(
                children: [
                  const Text(
                    'SmartPay',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '© 2026 SmartPay. All rights reserved.',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeaturesSection extends StatelessWidget {
  const _FeaturesSection();

  @override
  Widget build(BuildContext context) {
    final features = [
      {
        'icon': LucideIcons.brain,
        'title': 'AI Insights',
        'desc': 'Smart categorization and spending predictions.'
      },
      {
        'icon': LucideIcons.split,
        'title': 'Easy Splitting',
        'desc': 'Split bills with friends in EQUAL or EXACT amounts.'
      },
      {
        'icon': LucideIcons.shieldCheck,
        'title': 'Fraud Detection',
        'desc': 'Real-time risk scoring for every transaction.'
      },
      {
        'icon': LucideIcons.fileText,
        'title': 'AI Bill OCR',
        'desc': 'Scan bills and let AI extract the details for you.'
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Features',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 0.8,
            ),
            itemCount: features.length,
            itemBuilder: (context, index) {
              final f = features[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade100),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(f['icon'] as IconData, color: const Color(0xFF00C896)),
                    const SizedBox(height: 12),
                    Text(
                      f['title'] as String,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      f['desc'] as String,
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
