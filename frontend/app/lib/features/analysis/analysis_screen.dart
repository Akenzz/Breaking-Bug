import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/models/app_models.dart';

class AnalysisScreen extends ConsumerWidget {
  const AnalysisScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analysisAsync = ref.watch(analysisProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial Analysis'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () {
              ref.invalidate(analysisProvider);
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: analysisAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (analysis) {
          if (analysis == null) {
            return const Center(child: Text('No analysis data available. Try adding some transactions first.'));
          }

          return SingleChildScrollView(
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
                _HealthScoreCard(
                  score: analysis.healthScore,
                  grade: analysis.healthGrade,
                ),
                const SizedBox(height: 24),
                
                // Score Breakdown
                const Text(
                  'Score Breakdown',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _ScoreBreakdown(breakdown: analysis.healthBreakdown),
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
                  children: [
                    _MiniStatCard(label: 'Total Spending', value: '₹${analysis.healthStats.totalSpending.toStringAsFixed(2)}'),
                    _MiniStatCard(label: 'Total Income', value: '₹${analysis.healthStats.totalIncome.toStringAsFixed(2)}'),
                    _MiniStatCard(
                      label: 'Net Cash Flow', 
                      value: '${analysis.healthStats.netCashFlow >= 0 ? "+" : ""}₹${analysis.healthStats.netCashFlow.toStringAsFixed(2)}', 
                      color: analysis.healthStats.netCashFlow >= 0 ? const Color(0xFF00C896) : Colors.red
                    ),
                    _MiniStatCard(label: 'Transactions', value: '${analysis.healthStats.transactionCount}'),
                    _MiniStatCard(label: 'Avg Transaction', value: '₹${analysis.healthStats.averageTransaction.toStringAsFixed(2)}'),
                    _MiniStatCard(label: 'In / Out', value: '${analysis.healthStats.incomingCount} / ${analysis.healthStats.outgoingCount}'),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Spending by Category
                const Text(
                  'Spending by Category',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _CategoryChartCard(categoryTotals: analysis.categoryTotals, totalSpending: analysis.healthStats.totalSpending),
                const SizedBox(height: 24),

                // Top Recipients
                const Text(
                  'Top Recipients',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _TopRecipients(recipients: analysis.topRecipients),
                const SizedBox(height: 24),

                // Spending Prediction
                const Text(
                  'Spending Prediction',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _PredictionCard(prediction: analysis.prediction),
                const SizedBox(height: 24),

                // Anomaly Detection
                const Text(
                  'Anomaly Detection',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _AnomalySection(anomalies: analysis.anomalies, skipped: analysis.anomalySkipped),
                const SizedBox(height: 24),

                // AI Insights
                const Text(
                  'AI Insights',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _AIInsights(insights: analysis.insights),
                const SizedBox(height: 32),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _HealthScoreCard extends StatelessWidget {
  final int score;
  final String grade;
  const _HealthScoreCard({required this.score, required this.grade});

  @override
  Widget build(BuildContext context) {
    Color scoreColor = Colors.red;
    if (score >= 80) scoreColor = const Color(0xFF00C896);
    else if (score >= 60) scoreColor = Colors.blue;
    else if (score >= 40) scoreColor = Colors.orange;

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
                    value: score / 100,
                    strokeWidth: 10,
                    backgroundColor: Colors.grey.shade100,
                    color: scoreColor,
                  ),
                ),
                Column(
                  children: [
                    Text(
                      '$score',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                    const Text(
                      '/ 100',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            Text(
              'GRADE $grade',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: scoreColor,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScoreBreakdown extends StatelessWidget {
  final HealthBreakdown breakdown;
  const _ScoreBreakdown({required this.breakdown});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _BreakdownRow(
              label: 'Consistency', 
              score: '${breakdown.consistency.score}/${breakdown.consistency.max}', 
              description: 'How regularly you transact'
            ),
            const Divider(),
            _BreakdownRow(
              label: 'Spike Control', 
              score: '${breakdown.spikeControl.score}/${breakdown.spikeControl.max}', 
              description: 'Avoidance of sudden large spends'
            ),
            const Divider(),
            _BreakdownRow(
              label: 'Category Diversity', 
              score: '${breakdown.categoryDiversity.score}/${breakdown.categoryDiversity.max}', 
              description: 'Spread across spending categories'
            ),
            const Divider(),
            _BreakdownRow(
              label: 'Anomaly Penalty', 
              score: '${breakdown.anomalyPenalty.score}/${breakdown.anomalyPenalty.max}', 
              description: 'Deduction for anomalous transactions'
            ),
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

class _CategoryChartCard extends StatelessWidget {
  final Map<String, double> categoryTotals;
  final double totalSpending;

  const _CategoryChartCard({required this.categoryTotals, required this.totalSpending});

  @override
  Widget build(BuildContext context) {
    final sortedCategories = categoryTotals.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    final topCategory = sortedCategories.isNotEmpty ? sortedCategories.first : null;
    final topPercentage = (topCategory != null && totalSpending > 0) 
        ? (topCategory.value / totalSpending * 100).toStringAsFixed(1) 
        : '0';

    final colors = [const Color(0xFF00C896), Colors.purple, Colors.orange, Colors.blue, Colors.pink, Colors.amber];

    return Card(
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
                  child: Center(
                    child: Text(
                      '$topPercentage%\n${topCategory?.key ?? "N/A"}', 
                      textAlign: TextAlign.center, 
                      style: const TextStyle(fontWeight: FontWeight.bold)
                    )
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            ...sortedCategories.asMap().entries.map((entry) {
              final idx = entry.key;
              final cat = entry.value;
              final percentage = totalSpending > 0 ? (cat.value / totalSpending * 100).toStringAsFixed(1) : '0';
              return _CategoryRow(
                label: cat.key, 
                percentage: '$percentage%', 
                amount: '₹${cat.value.toStringAsFixed(0)}', 
                color: colors[idx % colors.length]
              );
            }),
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

class _TopRecipients extends StatelessWidget {
  final List<TopRecipient> recipients;
  const _TopRecipients({required this.recipients});

  @override
  Widget build(BuildContext context) {
    if (recipients.isEmpty) {
      return const Card(child: Padding(padding: EdgeInsets.all(16), child: Text("No recipient data available")));
    }

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
              child: Text(r.recipient.isNotEmpty ? r.recipient[0].toUpperCase() : '?'),
            ),
            title: Text(r.recipient, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Text('${r.primaryCategory} · ${r.transactionCount} txns', style: const TextStyle(fontSize: 12)),
            trailing: Text('₹${r.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
          );
        },
      ),
    );
  }
}

class _PredictionCard extends StatelessWidget {
  final PredictionResult prediction;
  const _PredictionCard({required this.prediction});

  @override
  Widget build(BuildContext context) {
    final isIncreasing = prediction.trend.toLowerCase().contains('increase') || 
                        prediction.trend.toLowerCase().contains('up');

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Model: ${prediction.method}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: (isIncreasing ? Colors.red : const Color(0xFF00C896)).withValues(alpha: 0.1), 
                    borderRadius: BorderRadius.circular(4)
                  ),
                  child: Text(
                    'Trend: ${prediction.trend}', 
                    style: TextStyle(
                      fontSize: 10, 
                      color: isIncreasing ? Colors.red : const Color(0xFF00C896), 
                      fontWeight: FontWeight.bold
                    )
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _PredictItem(label: 'Predicted Next', value: '₹${prediction.predictedNextAmount.toStringAsFixed(0)}'),
                _PredictItem(label: 'Confidence', value: '${(prediction.modelConfidence * 100).toStringAsFixed(1)}%'),
              ],
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

class _AnomalySection extends StatelessWidget {
  final List<dynamic> anomalies;
  final bool skipped;
  const _AnomalySection({required this.anomalies, required this.skipped});

  @override
  Widget build(BuildContext context) {
    if (skipped) {
      return Card(
        child: ListTile(
          leading: const Icon(LucideIcons.info, color: Colors.blue),
          title: const Text('Detection Skipped', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          subtitle: const Text('Needs at least 25 transactions for anomaly detection.', style: TextStyle(fontSize: 12)),
        ),
      );
    }

    if (anomalies.isEmpty) {
      return Card(
        child: ListTile(
          leading: const Icon(LucideIcons.shieldCheck, color: Color(0xFF00C896)),
          title: const Text('No anomalies detected', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          subtitle: const Text('Your spending patterns look normal.', style: TextStyle(fontSize: 12)),
        ),
      );
    }

    return Column(
      children: anomalies.map((a) => Card(
        child: ListTile(
          leading: const Icon(LucideIcons.alertTriangle, color: Colors.orange),
          title: Text(a['description'] ?? 'Suspicious transaction', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          subtitle: Text(a['reason'] ?? '', style: const TextStyle(fontSize: 12)),
          trailing: Text('₹${a['amount']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange)),
        ),
      )).toList(),
    );
  }
}

class _AIInsights extends StatelessWidget {
  final List<String> insights;
  const _AIInsights({required this.insights});

  @override
  Widget build(BuildContext context) {
    if (insights.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text("No insights available yet."),
      );
    }

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
