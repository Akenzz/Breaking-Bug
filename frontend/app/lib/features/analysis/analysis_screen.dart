import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

class AnalysisScreen extends ConsumerWidget {
  const AnalysisScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial Analysis'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () {
              // ref.invalidate(analysisProvider);
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'AI-powered insights into your spending behaviour',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 24),
            
            // Financial Health Score
            const _HealthScoreCard(),
            const SizedBox(height: 24),
            
            // Score Breakdown
            const Text(
              'Score Breakdown',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const _ScoreBreakdown(),
            const SizedBox(height: 24),

            // Summary Stats Grid
            const Text(
              'Summary Stats',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.2,
              children: const [
                _MiniStatCard(label: 'Total Spending', value: '₹64,906.10'),
                _MiniStatCard(label: 'Total Income', value: '₹91,745.50'),
                _MiniStatCard(label: 'Net Cash Flow', value: '+₹26,839.40', color: Color(0xFF00C896)),
                _MiniStatCard(label: 'Transactions', value: '17'),
                _MiniStatCard(label: 'Avg Transaction', value: '₹6,490.61'),
                _MiniStatCard(label: 'In / Out', value: '7 / 10'),
              ],
            ),
            const SizedBox(height: 24),
            
            // Spending by Category
            const Text(
              'Spending by Category',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    SizedBox(
                      height: 180,
                      child: Center(
                        child: Container(
                          width: 150,
                          height: 150,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF00C896), width: 20),
                          ),
                          child: const Center(child: Text('96.3%\nOthers', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold))),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    _CategoryRow(label: 'Others', percentage: '96.3%', amount: '₹62,500', color: const Color(0xFF00C896)),
                    _CategoryRow(label: 'Entertainment', percentage: '2.2%', amount: '₹1,429', color: Colors.purple),
                    _CategoryRow(label: 'Food', percentage: '1.5%', amount: '₹978', color: Colors.orange),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Top Recipients
            const Text(
              'Top Recipients',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const _TopRecipients(),
            const SizedBox(height: 24),

            // Spending Prediction
            const Text(
              'Spending Prediction',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const _PredictionCard(),
            const SizedBox(height: 24),

            // AI Insights
            const Text(
              'AI Insights',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const _AIInsights(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _HealthScoreCard extends StatelessWidget {
  const _HealthScoreCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            const Text(
              'Financial Health Score',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  height: 120,
                  width: 120,
                  child: CircularProgressIndicator(
                    value: 0.47,
                    strokeWidth: 10,
                    backgroundColor: Colors.grey.shade100,
                    color: Colors.orange,
                  ),
                ),
                const Column(
                  children: [
                    Text(
                      '47',
                      style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '/ 100',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              'GRADE NEEDS IMPROVEMENT — FAIR',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.orange,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Room to improve',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScoreBreakdown extends StatelessWidget {
  const _ScoreBreakdown();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _BreakdownRow(label: 'Consistency', score: '0/30', description: 'How regularly you transact'),
            const Divider(),
            _BreakdownRow(label: 'Spike Control', score: '15/25', description: 'Avoidance of sudden large spends'),
            const Divider(),
            _BreakdownRow(label: 'Category Diversity', score: '12/25', description: 'Spread across spending categories'),
            const Divider(),
            _BreakdownRow(label: 'Anomaly Penalty', score: '20/20', description: 'Deduction for anomalous transactions'),
          ],
        ),
      ),
    );
  }
}

class _BreakdownRow extends StatelessWidget {
  final String label;
  final String score;
  final String description;

  const _BreakdownRow({required this.label, required this.score, required this.description});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(description, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          Text(score, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
        ],
      ),
    );
  }
}

class _TopRecipients extends StatelessWidget {
  const _TopRecipients();

  @override
  Widget build(BuildContext context) {
    final recipients = [
      {'name': 'Akenzz', 'category': 'Others', 'amount': '₹60,008', 'txns': '3'},
      {'name': 'Tester', 'category': 'Others', 'amount': '₹2,500', 'txns': '1'},
      {'name': 'Berry', 'category': 'Entertainment', 'amount': '₹1,429', 'txns': '1'},
      {'name': 'Gandu', 'category': 'Food', 'amount': '₹970', 'txns': '5'},
    ];

    return Card(
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: recipients.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final r = recipients[index];
          return ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.grey.shade100,
              child: Text(r['name']![0]),
            ),
            title: Text(r['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Text('${r['category']} · ${r['txns']} txns', style: const TextStyle(fontSize: 12)),
            trailing: Text(r['amount']!, style: const TextStyle(fontWeight: FontWeight.bold)),
          );
        },
      ),
    );
  }
}

class _PredictionCard extends StatelessWidget {
  const _PredictionCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Model: linear_regression', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                  child: const Text('Trend: decreasing', style: TextStyle(fontSize: 10, color: Colors.red, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _PredictItem(label: 'Predicted Next', value: '₹0'),
                _PredictItem(label: 'Recent Avg', value: '₹140'),
                _PredictItem(label: 'Confidence', value: '10.0%'),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'Note: Low confidence prediction. Needs more transaction data for accuracy.',
              style: TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
    );
  }
}

class _PredictItem extends StatelessWidget {
  final String label;
  final String value;
  const _PredictItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _AIInsights extends StatelessWidget {
  const _AIInsights();

  @override
  Widget build(BuildContext context) {
    final insights = [
      "'Others' category accounts for 96.3% of outgoing — recommends reclassifying large expenses",
      "Strong positive net cash flow of ₹26,839.40 over 3-day period — recommends directing surplus to savings/investments",
      "Financial Health Score 47/100 despite positive cash flow — indicates broader financial stability concerns",
      "Food (₹977.53) and Entertainment (₹1,428.57) spending is appropriate but suggests setting budgets",
      "Analysis covers only 3 days — recommends longer financial history for comprehensive insights",
    ];

    return Column(
      children: insights.map((insight) => Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(LucideIcons.sparkles, size: 16, color: Color(0xFF00C896)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  insight,
                  style: const TextStyle(fontSize: 13, height: 1.4),
                ),
              ),
            ],
          ),
        ),
      )).toList(),
    );
  }
}

class _MiniStatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const _MiniStatCard({
    required this.label,
    required this.value,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  final String label;
  final String percentage;
  final String amount;
  final Color color;

  const _CategoryRow({
    required this.label,
    required this.percentage,
    required this.amount,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
          ),
          Text(
            percentage,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(width: 16),
          Text(
            amount,
            style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }
}
