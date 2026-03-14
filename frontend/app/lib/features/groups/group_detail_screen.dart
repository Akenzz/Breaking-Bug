import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/models/app_models.dart';
import 'package:smartpay/shared/utils/api_config.dart';

class GroupDetailScreen extends ConsumerStatefulWidget {
  final String groupId;
  const GroupDetailScreen({super.key, required this.groupId});

  @override
  ConsumerState<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends ConsumerState<GroupDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  void _showAddExpenseDialog(GroupDetail detail) {
    final descController = TextEditingController();
    final amountController = TextEditingController();
    String splitType = 'EQUAL';
    List<int> selectedMemberIds = detail.members.map((m) => m.userId).toList();
    Map<int, TextEditingController> exactControllers = {
      for (var m in detail.members) m.userId: TextEditingController(),
    };
    bool isParsingBill = false;
    String? parsedBillCategory;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          Future<void> pickAndParseBill() async {
            final picker = ImagePicker();
            final XFile? image = await picker.pickImage(
              source: ImageSource.gallery,
              maxWidth: 1920,
              maxHeight: 1080,
              imageQuality: 85,
            );
            if (image == null) return;

            setDialogState(() => isParsingBill = true);
            try {
              final api = ref.read(apiServiceProvider);
              final response = await api.postMultipart(
                ApiConfig.parseBills,
                File(image.path),
              );
              if (response.statusCode == 200) {
                final responseBody = await response.stream.bytesToString();
                final data = jsonDecode(responseBody);
                if (data['success'] == true) {
                  final bill = ParsedBill.fromJson(data['data']);
                  setDialogState(() {
                    descController.text = bill.merchant;
                    amountController.text = bill.total.toStringAsFixed(2);
                    parsedBillCategory = bill.category;
                  });
                }
              }
            } catch (e) {
              debugPrint('[GroupDetail] Bill parse error: $e');
            } finally {
              setDialogState(() => isParsingBill = false);
            }
          }

          return AlertDialog(
            title: Row(
              children: [
                const Expanded(child: Text('Add Expense')),
                if (isParsingBill)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Color(0xFF00C896),
                    ),
                  )
                else
                  TextButton.icon(
                    onPressed: pickAndParseBill,
                    icon: const Icon(LucideIcons.scanLine, size: 16),
                    label: const Text(
                      'Scan Bill',
                      style: TextStyle(fontSize: 12),
                    ),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF00C896),
                    ),
                  ),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (parsedBillCategory != null)
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00C896).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: const Color(0xFF00C896).withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            LucideIcons.checkCircle,
                            size: 14,
                            color: Color(0xFF00C896),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Bill scanned · $parsedBillCategory',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF00C896),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  TextField(
                    controller: descController,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      hintText: 'e.g. Dinner',
                    ),
                  ),
                  TextField(
                    controller: amountController,
                    decoration: const InputDecoration(
                      labelText: 'Amount',
                      prefixText: '₹ ',
                    ),
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    onChanged: (v) => setDialogState(() {}),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('EQUAL'),
                          selected: splitType == 'EQUAL',
                          onSelected: (v) =>
                              setDialogState(() => splitType = 'EQUAL'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('EXACT'),
                          selected: splitType == 'EXACT',
                          onSelected: (v) =>
                              setDialogState(() => splitType = 'EXACT'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (splitType == 'EQUAL') ...[
                    const Text(
                      'Split between:',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    ...detail.members.map(
                      (m) => CheckboxListTile(
                        title: Text(
                          m.fullName,
                          style: const TextStyle(fontSize: 14),
                        ),
                        value: selectedMemberIds.contains(m.userId),
                        onChanged: (v) {
                          setDialogState(() {
                            if (v!) {
                              selectedMemberIds.add(m.userId);
                            } else {
                              selectedMemberIds.remove(m.userId);
                            }
                          });
                        },
                        dense: true,
                      ),
                    ),
                  ] else ...[
                    const Text(
                      'Exact amounts:',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    ...detail.members.map(
                      (m) => Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                m.fullName,
                                style: const TextStyle(fontSize: 14),
                              ),
                            ),
                            SizedBox(
                              width: 80,
                              child: TextField(
                                controller: exactControllers[m.userId],
                                decoration: const InputDecoration(
                                  hintText: '0.00',
                                  prefixText: '₹',
                                ),
                                keyboardType:
                                    const TextInputType.numberWithOptions(
                                      decimal: true,
                                    ),
                                style: const TextStyle(fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () async {
                  final api = ref.read(apiServiceProvider);
                  final amount = double.tryParse(amountController.text) ?? 0.0;

                  Map<String, dynamic> payload = {
                    'groupId': int.parse(widget.groupId),
                    'description': descController.text,
                    'amount': amount,
                    'splitType': splitType,
                  };

                  if (splitType == 'EQUAL') {
                    payload['userIds'] = selectedMemberIds;
                  } else {
                    payload['exactSplits'] = exactControllers.entries
                        .map(
                          (e) => {
                            'userId': e.key,
                            'amount': double.tryParse(e.value.text) ?? 0.0,
                          },
                        )
                        .where((e) => (e['amount'] as double) > 0)
                        .toList();
                  }

                  await api.post(ApiConfig.createExpense, payload);
                  if (context.mounted) {
                    Navigator.pop(context);
                    ref.invalidate(groupDetailProvider(widget.groupId));
                  }
                },
                child: const Text('Add'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(groupDetailProvider(widget.groupId));

    return detailAsync.when(
      data: (detail) {
        if (detail == null)
          return const Scaffold(body: Center(child: Text('Group not found')));

        return Scaffold(
          appBar: AppBar(
            title: Text(detail.group.name),
            actions: [
              IconButton(
                icon: const Icon(LucideIcons.refreshCw),
                onPressed: () =>
                    ref.invalidate(groupDetailProvider(widget.groupId)),
              ),
            ],
            bottom: TabBar(
              controller: _tabController,
              isScrollable: true,
              labelColor: const Color(0xFF00C896),
              unselectedLabelColor: Colors.grey,
              indicatorColor: const Color(0xFF00C896),
              tabs: [
                Tab(text: 'Transactions (${detail.transactions.length})'),
                Tab(text: 'Expenses (${detail.expenses.length})'),
                Tab(text: 'Balances (${detail.balances.length})'),
                Tab(text: 'Members (${detail.members.length})'),
              ],
            ),
          ),
          body: Column(
            children: [
              _GroupHeaderStats(detail: detail),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _TransactionsTab(transactions: detail.transactions),
                    _ExpensesTab(expenses: detail.expenses),
                    _BalancesTab(balances: detail.balances),
                    _MembersTab(
                      members: detail.members,
                      groupId: widget.groupId,
                      onRefresh: () =>
                          ref.invalidate(groupDetailProvider(widget.groupId)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => _showAddExpenseDialog(detail),
            backgroundColor: Colors.black,
            icon: const Icon(LucideIcons.plus, color: Colors.white),
            label: const Text(
              'Add Expense',
              style: TextStyle(color: Colors.white),
            ),
          ),
        );
      },
      loading: () =>
          const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, s) => Scaffold(body: Center(child: Text('Error: $e'))),
    );
  }
}

class _GroupHeaderStats extends StatelessWidget {
  final GroupDetail detail;
  const _GroupHeaderStats({required this.detail});

  @override
  Widget build(BuildContext context) {
    final totalExpenses = detail.transactions
        .where((t) => t.type == 'EXPENSE')
        .fold(0.0, (sum, t) => sum + t.amount);

    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            detail.group.name,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          Text(
            '${detail.group.description ?? ""} · Admin: ${detail.group.createdByName ?? "Unknown"}',
            style: const TextStyle(fontSize: 14, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _HeaderItem(label: 'Members', value: '${detail.members.length}'),
              _HeaderItem(
                label: 'Total Expenses',
                value: '₹${totalExpenses.toStringAsFixed(2)}',
              ),
              _HeaderItem(
                label: 'Your Balance',
                value:
                    '${detail.myBalance >= 0 ? "+" : ""}₹${detail.myBalance.toStringAsFixed(2)}',
                valueColor: detail.myBalance >= 0
                    ? const Color(0xFF00C896)
                    : Colors.red,
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

  const _HeaderItem({
    required this.label,
    required this.value,
    this.valueColor,
  });

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
  final List<Transaction> transactions;
  const _TransactionsTab({required this.transactions});

  @override
  Widget build(BuildContext context) {
    if (transactions.isEmpty)
      return const Center(child: Text('No transactions yet'));

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: transactions.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final tx = transactions[index];
        final isExpense = tx.type == 'EXPENSE';
        return ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(
            tx.description,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          subtitle: Text(
            '${tx.fromUserName} · ${tx.createdAt ?? ""}',
            style: const TextStyle(fontSize: 12),
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isExpense ? "-" : "+"}₹${tx.amount.toStringAsFixed(2)}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isExpense ? Colors.red : const Color(0xFF00C896),
                ),
              ),
              Text(
                tx.type,
                style: const TextStyle(fontSize: 10, color: Colors.grey),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ExpensesTab extends ConsumerWidget {
  final List<GroupExpense> expenses;
  const _ExpensesTab({required this.expenses});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (expenses.isEmpty)
      return const Center(child: Text('No expenses recorded'));

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
          title: Text(
            ex.description,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          subtitle: Text(
            'Paid by ${ex.paidByName}',
            style: const TextStyle(fontSize: 12),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '₹${ex.totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              if (!ex.isCancelled)
                IconButton(
                  icon: const Icon(
                    LucideIcons.trash2,
                    size: 16,
                    color: Colors.red,
                  ),
                  onPressed: () async {
                    final api = ref.read(apiServiceProvider);
                    await api.delete('${ApiConfig.createExpense}/${ex.id}');
                    ref.invalidate(
                      groupDetailProvider(ex.groupName),
                    ); // This is tricky, need groupId
                  },
                ),
            ],
          ),
        );
      },
    );
  }
}

class _BalancesTab extends StatelessWidget {
  final List<UserBalance> balances;
  const _BalancesTab({required this.balances});

  @override
  Widget build(BuildContext context) {
    if (balances.isEmpty) return const Center(child: Text('No balances yet'));

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: balances.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final b = balances[index];
        final isPos = b.netBalance >= 0;
        return ListTile(
          contentPadding: EdgeInsets.zero,
          leading: CircleAvatar(
            backgroundColor: Colors.grey.shade100,
            child: Text(
              b.fullName.isNotEmpty ? b.fullName[0].toUpperCase() : '?',
            ),
          ),
          title: Text(
            b.fullName,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          trailing: Text(
            '${isPos ? "+" : ""}₹${b.netBalance.toStringAsFixed(2)}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isPos ? const Color(0xFF00C896) : Colors.red,
            ),
          ),
        );
      },
    );
  }
}

class _MembersTab extends ConsumerWidget {
  final List<GroupMember> members;
  final String groupId;
  final VoidCallback onRefresh;
  const _MembersTab({
    required this.members,
    required this.groupId,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton.icon(
            onPressed: () {
              final controller = TextEditingController();
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Add Member'),
                  content: TextField(
                    controller: controller,
                    decoration: const InputDecoration(
                      labelText: 'Email or Phone',
                    ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    ElevatedButton(
                      onPressed: () async {
                        final api = ref.read(apiServiceProvider);
                        await api.post(
                          '${ApiConfig.baseUrl}/groups/$groupId/members?identifier=${controller.text}',
                          {},
                        );
                        if (context.mounted) {
                          Navigator.pop(context);
                          onRefresh();
                        }
                      },
                      child: const Text('Add'),
                    ),
                  ],
                ),
              );
            },
            icon: const Icon(LucideIcons.userPlus, size: 18),
            label: const Text('Add Member'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00C896),
            ),
          ),
        ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: members.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final m = members[index];
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(
                  backgroundColor: Colors.grey.shade100,
                  child: Text(
                    m.fullName.isNotEmpty ? m.fullName[0].toUpperCase() : '?',
                  ),
                ),
                title: Text(
                  m.fullName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                subtitle: Text(
                  m.identifier,
                  style: const TextStyle(fontSize: 12),
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    m.role,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
