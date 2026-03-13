import 'package:flutter/material.dart';

class SettleScreen extends StatefulWidget {
  const SettleScreen({super.key});

  @override
  State<SettleScreen> createState() => _SettleScreenState();
}

class _SettleScreenState extends State<SettleScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settle Up'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.black,
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFF00C896),
          tabs: const [
            Tab(text: 'Owes Me (3)'),
            Tab(text: 'I Owe (4)'),
          ],
        ),
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            color: Colors.grey.shade50,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _SummaryStat(label: 'Owed To You', value: '₹91,745.50', color: const Color(0xFF00C896)),
                Container(width: 1, height: 40, color: Colors.grey.shade200),
                _SummaryStat(label: 'You Owe', value: '₹65,040.99', color: Colors.red),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _OwesMeTab(),
                _IOweTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _SummaryStat({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}

class _OwesMeTab extends StatelessWidget {
  final List<Map<String, String>> data = [
    {'name': 'Sudhanva Kulkarni', 'amount': '+₹30,580.50'},
    {'name': 'Akenzz', 'amount': '+₹30,584.50'},
    {'name': 'Tester', 'amount': '+₹30,580.50'},
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: data.length,
      itemBuilder: (context, index) {
        final item = data[index];
        return Card(
          child: ListTile(
            title: Text(item['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
            trailing: Text(item['amount']!, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00C896))),
            onTap: () {},
          ),
        );
      },
    );
  }
}

class _IOweTab extends StatelessWidget {
  final List<Map<String, String>> data = [
    {'name': 'Akenzz', 'amount': '₹60,142.89'},
    {'name': 'Gandu', 'amount': '₹969.53'},
    {'name': 'Berry', 'amount': '₹1,428.57'},
    {'name': 'Tester', 'amount': '₹2,500.00'},
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: data.length,
      itemBuilder: (context, index) {
        final item = data[index];
        return Card(
          child: ListTile(
            title: Text(item['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(item['amount']!, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                const Text('Pay Now', style: TextStyle(fontSize: 10, color: Color(0xFF00C896), fontWeight: FontWeight.bold)),
              ],
            ),
            onTap: () {},
          ),
        );
      },
    );
  }
}
