import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:smartpay/shared/services/providers.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  bool _isBalanceHidden = false;

  @override
  Widget build(BuildContext context) {
    final userAsync = ref.watch(userProfileProvider);
    final summaryAsync = ref.watch(dashboardSummaryProvider);
    final summary = summaryAsync.value?['summary'] ?? {};
    final balanceData = summaryAsync.value?['balance'] ?? {};

    return Scaffold(
      appBar: AppBar(
        title: userAsync.when(
          data: (user) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Dashboard Overview'),
              Text(
                'Good afternoon, ${user?.fullName ?? "User"}. Here\'s your financial snapshot.',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          loading: () => const Text('Loading...'),
          error: (e, s) => const Text('Dashboard'),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: summaryAsync.when(
        data: (_) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(userProfileProvider);
            ref.invalidate(dashboardSummaryProvider);
            ref.invalidate(dashboardChartProvider);
            ref.invalidate(transactionsProvider);
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const _QuickActions(),
                const SizedBox(height: 24),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _StatCard(title: 'Friends', value: '${summary['friendCount'] ?? 0}'),
                      const SizedBox(width: 12),
                      _StatCard(title: 'Groups', value: '${summary['groupCount'] ?? 0}'),
                      const SizedBox(width: 12),
                      _StatCard(
                        title: 'Owed To You',
                        value: '₹${(summary['totalIsOwed'] ?? 0).toStringAsFixed(2)}',
                        color: const Color(0xFF00C896),
                      ),
                      const SizedBox(width: 12),
                      _StatCard(
                        title: 'You Owe',
                        value: '₹${(summary['totalOwes'] ?? 0).toStringAsFixed(2)}',
                        color: Colors.red,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _NetBalanceCard(
                  balance: (summary['totalBalance'] ?? 0).toDouble(),
                  owe: (summary['totalOwes'] ?? 0).toDouble(),
                  owed: (summary['totalIsOwed'] ?? 0).toDouble(),
                  monthlySpent: (balanceData['monthlySpent'] ?? 0).toDouble(),
                  isHidden: _isBalanceHidden,
                  onToggle: () => setState(() => _isBalanceHidden = !_isBalanceHidden),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Money Flow',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                const _MoneyFlowChart(),
                const SizedBox(height: 24),
                const Text(
                  'Recent Activity',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                const _RecentActivityList(),
                const SizedBox(height: 24),
                _BalanceLists(
                  owedToYou: summaryAsync.value?['owedToYou'] ?? [],
                  youOwe: summaryAsync.value?['youOwe'] ?? [],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    final actions = [
      {'icon': LucideIcons.qrCode, 'label': 'Pay', 'route': '/pay'},
      {'icon': LucideIcons.split, 'label': 'Split', 'route': '/split'},
      {'icon': LucideIcons.users, 'label': 'Groups', 'route': '/groups'},
      {'icon': LucideIcons.wallet, 'label': 'Settle', 'route': '/settle'},
      {'icon': LucideIcons.fileText, 'label': 'Bills', 'route': '/bills'},
      {'icon': LucideIcons.userPlus, 'label': 'Friends', 'route': '/friends'},
      {'icon': LucideIcons.history, 'label': 'History', 'route': '/transactions'},
      {'icon': LucideIcons.creditCard, 'label': 'Payments', 'route': '/payments'},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.8,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final action = actions[index];
        return InkWell(
          onTap: () => context.push(action['route'] as String),
          borderRadius: BorderRadius.circular(12),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Icon(action['icon'] as IconData, size: 24),
              ),
              const SizedBox(height: 8),
              Text(
                action['label'] as String,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final Color? color;

  const _StatCard({
    required this.title,
    required this.value,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        width: 140,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
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

class _NetBalanceCard extends StatelessWidget {
  final double balance;
  final double owe;
  final double owed;
  final double monthlySpent;
  final bool isHidden;
  final VoidCallback onToggle;

  const _NetBalanceCard({
    required this.balance,
    required this.owe,
    required this.owed,
    required this.monthlySpent,
    required this.isHidden,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.black,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Net Balance',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
                IconButton(
                  icon: Icon(
                    isHidden ? LucideIcons.eyeOff : LucideIcons.eye,
                    color: Colors.white70,
                    size: 16,
                  ),
                  onPressed: onToggle,
                ),
              ],
            ),
            Text(
              isHidden ? '••••••••' : '₹${balance.toStringAsFixed(2)}',
              style: TextStyle(
                color: balance >= 0 ? const Color(0xFF00C896) : Colors.red.shade400,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            const Divider(color: Colors.white10),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _BalanceItem(
                  label: 'You owe',
                  value: '₹${owe.toStringAsFixed(2)}',
                  color: Colors.red.shade400,
                ),
                _BalanceItem(
                  label: 'Owed to you',
                  value: '₹${owed.toStringAsFixed(2)}',
                  color: const Color(0xFF00C896),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Monthly spent', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  Text(
                    '₹${monthlySpent.toStringAsFixed(2)}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
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

class _BalanceItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _BalanceItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

class _MoneyFlowChart extends ConsumerWidget {
  const _MoneyFlowChart();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chartAsync = ref.watch(dashboardChartProvider);

    return chartAsync.when(
      data: (data) {
        final labels = List<String>.from(data['labels'] ?? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
        final income = List<double>.from((data['income'] ?? [0.0, 100.0, 0.0, 50.0, 0.0, 200.0, 0.0]).map((e) => e.toDouble()));
        final expense = List<double>.from((data['expense'] ?? [50.0, 25.0, 70.0, 0.0, 150.0, 0.0, 90.0]).map((e) => e.toDouble()));

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _ChartLegendItem(label: 'Income', color: const Color(0xFF00C896), value: '₹${income.reduce((a, b) => a + b).toStringAsFixed(0)}'),
                    _ChartLegendItem(label: 'Expense', color: Colors.red, value: '₹${expense.reduce((a, b) => a + b).toStringAsFixed(0)}'),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: FlTitlesData(
                        show: true,
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              if (value.toInt() >= 0 && value.toInt() < labels.length) {
                                return Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Text(labels[value.toInt()], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                );
                              }
                              return const SizedBox.shrink();
                            },
                          ),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: income.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value)).toList(),
                          isCurved: true,
                          color: const Color(0xFF00C896),
                          barWidth: 3,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(show: true, color: const Color(0xFF00C896).withValues(alpha: 0.1)),
                        ),
                        LineChartBarData(
                          spots: expense.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value)).toList(),
                          isCurved: true,
                          color: Colors.red,
                          barWidth: 3,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(show: true, color: Colors.red.withValues(alpha: 0.1)),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
      loading: () => const SizedBox(height: 200, child: Center(child: CircularProgressIndicator())),
      error: (e, s) => const SizedBox(height: 200, child: Center(child: Text('Failed to load chart'))),
    );
  }
}

class _ChartLegendItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _ChartLegendItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _RecentActivityList extends ConsumerWidget {
  const _RecentActivityList();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final transactionsAsync = ref.watch(transactionsProvider);

    return transactionsAsync.when(
      data: (transactions) {
        if (transactions.isEmpty) {
          return const Center(child: Padding(
            padding: EdgeInsets.all(24.0),
            child: Text('No recent activity'),
          ));
        }
        
        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: transactions.length > 5 ? 5 : transactions.length,
          separatorBuilder: (context, index) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final tx = transactions[index];
            return Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.grey.shade100,
                  child: const Icon(LucideIcons.fileText, size: 18, color: Colors.black),
                ),
                title: Text(tx.description, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: Text(tx.fromUserName ?? '', style: const TextStyle(fontSize: 12)),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '₹${tx.amount.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold, 
                        color: tx.type == 'EXPENSE' ? Colors.red : const Color(0xFF00C896),
                      ),
                    ),
                    if (tx.createdAt != null)
                      Text(
                        tx.createdAt!,
                        style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
                      ),
                  ],
                ),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Text('Error: $e'),
    );
  }
}

class _BalanceLists extends StatelessWidget {
  final List<dynamic> owedToYou;
  final List<dynamic> youOwe;

  const _BalanceLists({required this.owedToYou, required this.youOwe});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (owedToYou.isNotEmpty) ...[
          const Text('Owed to you', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...owedToYou.map((item) => _BalanceCard(
            name: item['userName'] ?? 'Unknown',
            amount: (item['amount'] ?? 0).toDouble(),
            isOwed: true,
          )),
          const SizedBox(height: 24),
        ],
        if (youOwe.isNotEmpty) ...[
          const Text('You owe', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...youOwe.map((item) => _BalanceCard(
            name: item['userName'] ?? 'Unknown',
            amount: (item['amount'] ?? 0).toDouble(),
            isOwed: false,
          )),
        ],
      ],
    );
  }
}

class _BalanceCard extends StatelessWidget {
  final String name;
  final double amount;
  final bool isOwed;

  const _BalanceCard({
    required this.name,
    required this.amount,
    required this.isOwed,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.grey.shade100,
          child: Text(name[0].toUpperCase()),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        trailing: Text(
          '${isOwed ? "+" : "-"}₹${amount.toStringAsFixed(2)}',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isOwed ? const Color(0xFF00C896) : Colors.red,
          ),
        ),
      ),
    );
  }
}
