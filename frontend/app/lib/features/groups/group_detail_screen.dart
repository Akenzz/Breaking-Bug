import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
                  final parseResponse = ParseBillsResponse.fromJson(data);
                  if (parseResponse.results.isNotEmpty && parseResponse.results.first.success) {
                    final bill = parseResponse.results.first.data!;
                    setDialogState(() {
                      descController.text = bill.merchant;
                      amountController.text = bill.total.toStringAsFixed(2);
                      parsedBillCategory = bill.category;
                    });
                  }
                }
              }
            } catch (e) {
              debugPrint('[GroupDetail] Bill parse error: $e');
            } finally {
              setDialogState(() => isParsingBill = false);
            }
          }

          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Expanded(
                  child: Text(
                    'Add Expense',
                    style: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w700,
                      fontSize: 18,
                    ),
                  ),
                ),
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
                        borderRadius: BorderRadius.circular(10),
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
                              fontWeight: FontWeight.w600,
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
                  const SizedBox(height: 12),
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
                          selectedColor:
                              const Color(0xFF00C896).withValues(alpha: 0.15),
                          labelStyle: TextStyle(
                            color: splitType == 'EQUAL'
                                ? const Color(0xFF00C896)
                                : null,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('EXACT'),
                          selected: splitType == 'EXACT',
                          onSelected: (v) =>
                              setDialogState(() => splitType = 'EXACT'),
                          selectedColor:
                              const Color(0xFF00C896).withValues(alpha: 0.15),
                          labelStyle: TextStyle(
                            color: splitType == 'EXACT'
                                ? const Color(0xFF00C896)
                                : null,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (splitType == 'EQUAL') ...[
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Split between:',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.grey.shade600,
                        ),
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
                        activeColor: const Color(0xFF00C896),
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ] else ...[
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Exact amounts:',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.grey.shade600,
                        ),
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
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C896),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
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
        if (detail == null) {
          return const Scaffold(
            body: Center(child: Text('Group not found')),
          );
        }

        return Scaffold(
          backgroundColor: const Color(0xFFF2F7F5),
          body: Column(
            children: [
              _GroupHeroHeader(
                detail: detail,
                onRefresh: () =>
                    ref.invalidate(groupDetailProvider(widget.groupId)),
                tabController: _tabController,
              ),
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
            backgroundColor: const Color(0xFF00C896),
            elevation: 0,
            icon: const Icon(LucideIcons.plus, color: Colors.white),
            label: Text(
              'Add Expense',
              style: GoogleFonts.spaceGrotesk(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        );
      },
      loading: () => const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF00C896)),
        ),
      ),
      error: (e, s) => Scaffold(body: Center(child: Text('Error: $e'))),
    );
  }
}

class _GroupHeroHeader extends StatelessWidget {
  final GroupDetail detail;
  final VoidCallback onRefresh;
  final TabController tabController;

  const _GroupHeroHeader({
    required this.detail,
    required this.onRefresh,
    required this.tabController,
  });

  @override
  Widget build(BuildContext context) {
    final totalExpenses = detail.transactions
        .where((t) => t.type == 'EXPENSE')
        .fold(0.0, (sum, t) => sum + t.amount);
    final isPositive = detail.myBalance >= 0;

    return Container(
      color: const Color(0xFF0A0A0A),
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row: back + refresh
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      LucideIcons.chevronLeft,
                      color: Colors.white,
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: Icon(
                      LucideIcons.refreshCw,
                      color: Colors.white.withValues(alpha: 0.5),
                      size: 18,
                    ),
                    onPressed: onRefresh,
                  ),
                ],
              ),
            ),

            // Group name
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
              child: Text(
                detail.group.name,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -1.0,
                  height: 1.1,
                ),
              ),
            ),
            if (detail.group.description?.isNotEmpty == true)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
                child: Text(
                  detail.group.description!,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.40),
                  ),
                ),
              ),

            // Stats row
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Row(
                children: [
                  _StatPill(
                    label: 'MEMBERS',
                    value: '${detail.members.length}',
                    highlight: false,
                  ),
                  const SizedBox(width: 10),
                  _StatPill(
                    label: 'TOTAL SPENT',
                    value: '₹${totalExpenses.toStringAsFixed(0)}',
                    highlight: false,
                  ),
                  const SizedBox(width: 10),
                  _StatPill(
                    label: 'YOUR BALANCE',
                    value:
                        '${isPositive ? "+" : ""}₹${detail.myBalance.toStringAsFixed(0)}',
                    highlight: true,
                    highlightColor: isPositive
                        ? const Color(0xFF00C896)
                        : const Color(0xFFFF5252),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Tab bar
            TabBar(
              controller: tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white.withValues(alpha: 0.35),
              indicatorColor: const Color(0xFF00C896),
              indicatorSize: TabBarIndicatorSize.label,
              dividerColor: Colors.white.withValues(alpha: 0.08),
              labelStyle: GoogleFonts.spaceGrotesk(
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
              unselectedLabelStyle: GoogleFonts.spaceGrotesk(
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 8),
              tabs: [
                Tab(text: 'Txns (${detail.transactions.length})'),
                Tab(text: 'Expenses (${detail.expenses.length})'),
                Tab(text: 'Balances (${detail.balances.length})'),
                Tab(text: 'Members (${detail.members.length})'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final String label;
  final String value;
  final bool highlight;
  final Color? highlightColor;

  const _StatPill({
    required this.label,
    required this.value,
    required this.highlight,
    this.highlightColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: highlight
            ? (highlightColor ?? const Color(0xFF00C896))
                .withValues(alpha: 0.15)
            : Colors.white.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(10),
        border: highlight
            ? Border.all(
                color: (highlightColor ?? const Color(0xFF00C896))
                    .withValues(alpha: 0.3),
              )
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              color: Colors.white.withValues(alpha: 0.40),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: highlight
                  ? (highlightColor ?? const Color(0xFF00C896))
                  : Colors.white,
              letterSpacing: -0.4,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Tab content widgets ──────────────────────────────────────────────────────

class _TransactionsTab extends StatelessWidget {
  final List<Transaction> transactions;
  const _TransactionsTab({required this.transactions});

  @override
  Widget build(BuildContext context) {
    if (transactions.isEmpty) {
      return const Center(child: Text('No transactions yet'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: transactions.length,
      separatorBuilder: (context, index) =>
          const SizedBox(height: 0),
      itemBuilder: (context, index) {
        final tx = transactions[index];
        final isExpense = tx.type == 'EXPENSE';
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: isExpense
                      ? const Color(0xFFFF5252).withValues(alpha: 0.10)
                      : const Color(0xFF00C896).withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  isExpense ? LucideIcons.arrowUpRight : LucideIcons.arrowDownLeft,
                  size: 16,
                  color: isExpense
                      ? const Color(0xFFFF5252)
                      : const Color(0xFF00C896),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tx.description,
                      style: GoogleFonts.spaceGrotesk(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        letterSpacing: -0.2,
                      ),
                    ),
                    Text(
                      tx.fromUserName ?? '',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF888888),
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '${isExpense ? "-" : "+"}₹${tx.amount.toStringAsFixed(2)}',
                style: GoogleFonts.spaceGrotesk(
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                  color: isExpense
                      ? const Color(0xFFFF5252)
                      : const Color(0xFF00C896),
                  letterSpacing: -0.4,
                ),
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
    if (expenses.isEmpty) {
      return const Center(child: Text('No expenses recorded'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: expenses.length,
      itemBuilder: (context, index) {
        final ex = expenses[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F7F5),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  LucideIcons.fileText,
                  size: 16,
                  color: Color(0xFF0A0A0A),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ex.description,
                      style: GoogleFonts.spaceGrotesk(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        letterSpacing: -0.2,
                      ),
                    ),
                    Text(
                      'Paid by ${ex.paidByName}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF888888),
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '₹${ex.totalAmount.toStringAsFixed(2)}',
                    style: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                      letterSpacing: -0.4,
                    ),
                  ),
                  if (!ex.isCancelled)
                    IconButton(
                      icon: const Icon(
                        LucideIcons.trash2,
                        size: 16,
                        color: Color(0xFFFF5252),
                      ),
                      onPressed: () async {
                        final api = ref.read(apiServiceProvider);
                        await api.delete(
                          '${ApiConfig.createExpense}/${ex.id}',
                        );
                        ref.invalidate(groupDetailProvider(ex.groupName));
                      },
                    ),
                ],
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
    if (balances.isEmpty) {
      return const Center(child: Text('No balances yet'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: balances.length,
      itemBuilder: (context, index) {
        final b = balances[index];
        final isPos = b.netBalance >= 0;
        final initial =
            b.fullName.isNotEmpty ? b.fullName[0].toUpperCase() : '?';
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isPos
                      ? const Color(0xFF00C896).withValues(alpha: 0.10)
                      : const Color(0xFFFF5252).withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    initial,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: isPos
                          ? const Color(0xFF00C896)
                          : const Color(0xFFFF5252),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  b.fullName,
                  style: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    letterSpacing: -0.2,
                  ),
                ),
              ),
              Text(
                '${isPos ? "+" : ""}₹${b.netBalance.toStringAsFixed(2)}',
                style: GoogleFonts.spaceGrotesk(
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                  color: isPos
                      ? const Color(0xFF00C896)
                      : const Color(0xFFFF5252),
                  letterSpacing: -0.4,
                ),
              ),
            ],
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
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  title: Text(
                    'Add Member',
                    style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700),
                  ),
                  content: TextField(
                    controller: controller,
                    decoration: const InputDecoration(
                      labelText: 'Email or phone',
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
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00C896),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
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
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 52),
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            itemCount: members.length,
            itemBuilder: (context, index) {
              final m = members[index];
              final initial =
                  m.fullName.isNotEmpty ? m.fullName[0].toUpperCase() : '?';
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0A0A),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          initial,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            m.fullName,
                            style: GoogleFonts.spaceGrotesk(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              letterSpacing: -0.2,
                            ),
                          ),
                          Text(
                            m.identifier,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF888888),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: m.role == 'ADMIN'
                            ? const Color(0xFF00C896).withValues(alpha: 0.12)
                            : const Color(0xFFF2F7F5),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        m.role,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: m.role == 'ADMIN'
                              ? const Color(0xFF00C896)
                              : const Color(0xFF888888),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
