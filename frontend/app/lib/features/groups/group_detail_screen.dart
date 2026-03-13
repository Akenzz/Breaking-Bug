import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

class GroupDetailScreen extends ConsumerStatefulWidget {
  final String groupId;
  const GroupDetailScreen({super.key, required this.groupId});

  @override
  ConsumerState<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends ConsumerState<GroupDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    // In a real app, you'd fetch group-specific data here
    // final groupDetail = ref.watch(groupDetailProvider(widget.groupId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Group Details'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.moreVertical),
            onPressed: () {},
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: const Color(0xFF00C896),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFF00C896),
          tabs: const [
            Tab(text: 'Transactions'),
            Tab(text: 'Expenses'),
            Tab(text: 'Balances'),
            Tab(text: 'Members'),
          ],
        ),
      ),
      body: Column(
        children: [
          _GroupHeaderStats(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _TransactionsTab(),
                _ExpensesTab(),
                _BalancesTab(),
                _MembersTab(),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: Colors.black,
        icon: const Icon(LucideIcons.plus, color: Colors.white),
        label: const Text('Add Expense', style: TextStyle(color: Colors.white)),
      ),
    );
  }
}

class _GroupHeaderStats extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'MassTI',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const Text(
            'GGW · Admin: Tester',
            style: TextStyle(fontSize: 14, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _HeaderItem(label: 'Members', value: '7'),
              _HeaderItem(label: 'Total Expenses', value: '₹1,88,391.85'),
              _HeaderItem(
                label: 'Your Balance',
                value: '+₹25,671.65',
                valueColor: const Color(0xFF00C896),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeaderItem extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _HeaderItem({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}

class _TransactionsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Dummy data from documentation
    final transactions = [
      {'desc': 'rasmalai', 'by': 'beru', 'date': '13 Mar 2026', 'amount': '₹1,142.86', 'type': 'Expense'},
      {'desc': 'Bill: Navratna Veg Treat', 'by': 'beru', 'date': '10 Mar 2026', 'amount': '₹78.57', 'type': 'Expense'},
      {'desc': 'Bill: Nwkrtc', 'by': 'beru', 'date': '10 Mar 2026', 'amount': '₹47.75', 'type': 'Expense'},
      {'desc': '6 lolipops', 'by': 'beru', 'date': '10 Mar 2026', 'amount': '₹8.57', 'type': 'Expense'},
      {'desc': 'food 45thj', 'by': 'beru', 'date': '08 Mar 2026', 'amount': '₹300.00', 'type': 'Expense'},
      {'desc': 'Settlement', 'by': 'Akenzz', 'date': '08 Mar 2026', 'amount': '₹2,000.00', 'type': 'Settlement'},
    ];

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: transactions.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final tx = transactions[index];
        return ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(tx['desc']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          subtitle: Text('${tx['by']} · ${tx['date']}', style: const TextStyle(fontSize: 12)),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                tx['amount']!,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: tx['type'] == 'Expense' ? Colors.red : const Color(0xFF00C896),
                ),
              ),
              Text(tx['type']!, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
        );
      },
    );
  }
}

class _ExpensesTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final expenses = [
      {'desc': 'I-ran-ian funds', 'total': '₹10,000'},
      {'desc': 'food on 23rd', 'total': '₹1,12,322'},
      {'desc': 'testing for Main page', 'total': '₹10,000'},
      {'desc': 'Aaj raat ka dinner', 'total': '₹999.99'},
      {'desc': 'mera college fees', 'total': '₹3,00,000'},
    ];

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: expenses.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final ex = expenses[index];
        return ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const CircleAvatar(
            backgroundColor: Color(0xFFF8F9FA),
            child: Icon(LucideIcons.fileText, size: 18, color: Colors.black),
          ),
          title: Text(ex['desc']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          trailing: Text(
            ex['total']!,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        );
      },
    );
  }
}

class _BalancesTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final balances = [
      {'name': 'Akenzz', 'amount': '+₹2,70,178.65', 'isPos': true},
      {'name': 'beru (You)', 'amount': '+₹25,671.65', 'isPos': true},
      {'name': 'Berry', 'amount': '+₹6,794.56', 'isPos': true},
      {'name': 'Gandu', 'amount': '-₹57,672.06', 'isPos': false},
      {'name': 'Abhishek kuri', 'amount': '-₹63,372.10', 'isPos': false},
      {'name': 'Tester', 'amount': '-₹84,900.35', 'isPos': false},
    ];

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: balances.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final b = balances[index];
        final name = b['name'] as String;
        return ListTile(
          contentPadding: EdgeInsets.zero,
          leading: CircleAvatar(
            backgroundColor: Colors.grey.shade100,
            child: Text(name[0]),
          ),
          title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          trailing: Text(
            b['amount'] as String,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: b['isPos'] as bool ? const Color(0xFF00C896) : Colors.red,
            ),
          ),
        );
      },
    );
  }
}

class _MembersTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final members = [
      {'name': 'Tester', 'email': 'tester@mail.com', 'role': 'Admin'},
      {'name': 'Sudhanva Kulkarni', 'email': 'sudhnva@gmail.com', 'role': 'Member'},
      {'name': 'Akenzz', 'email': 'kiniamogh91@gmail.com', 'role': 'Member'},
      {'name': 'beru', 'email': 'email1@test.com', 'role': 'Member (You)'},
    ];

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: members.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final m = members[index];
        return ListTile(
          contentPadding: EdgeInsets.zero,
          leading: CircleAvatar(
            backgroundColor: Colors.grey.shade100,
            child: Text(m['name']![0]),
          ),
          title: Text(m['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          subtitle: Text(m['email']!, style: const TextStyle(fontSize: 12)),
          trailing: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              m['role']!,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        );
      },
    );
  }
}
