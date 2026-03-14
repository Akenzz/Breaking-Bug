import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/models/app_models.dart';
import 'package:smartpay/shared/utils/api_config.dart';

class SplitScreen extends ConsumerStatefulWidget {
  const SplitScreen({super.key});

  @override
  ConsumerState<SplitScreen> createState() => _SplitScreenState();
}

class _SplitScreenState extends ConsumerState<SplitScreen> {
  int _currentStep = 1;
  final List<int> _selectedFriendIds = [];
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  String _splitType = 'EQUAL';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _descController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _handleSplit() async {
    if (_descController.text.isEmpty || _amountController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final user = ref.read(userProfileProvider).value;
    final api = ref.read(apiServiceProvider);

    final payload = {
      'description': _descController.text,
      'amount': double.parse(_amountController.text),
      'payerId': user?.id,
      'splitType': _splitType,
      'userIds': [user?.id, ..._selectedFriendIds],
    };

    try {
      final res = await api.post(ApiConfig.directSplit, payload);
      if (mounted) {
        final decoded = jsonDecode(res.body);
        if (res.statusCode == 200 || res.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Split created successfully!')),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(decoded['message'] ?? 'Failed to create split'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F7F5),
      appBar: AppBar(
        title: const Text('Split Expense'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(52),
          child: _StepIndicator(currentStep: _currentStep),
        ),
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 280),
        transitionBuilder: (child, animation) => FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.06, 0),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        ),
        child: _currentStep == 1
            ? _buildStep1()
            : _buildStep2(),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFEEF2F0))),
        ),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 56),
            backgroundColor: const Color(0xFF0A0A0A),
          ),
          onPressed: _isSubmitting
              ? null
              : () {
                  if (_currentStep == 1) {
                    if (_selectedFriendIds.isNotEmpty) {
                      setState(() => _currentStep = 2);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Select at least one friend'),
                        ),
                      );
                    }
                  } else {
                    _handleSplit();
                  }
                },
          child: _isSubmitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_currentStep == 1 ? 'Next' : 'Create Split'),
                    const SizedBox(width: 8),
                    Icon(
                      _currentStep == 1
                          ? LucideIcons.arrowRight
                          : LucideIcons.checkCircle,
                      size: 18,
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildStep1() {
    final friendsAsync = ref.watch(friendsProvider);

    return Column(
      key: const ValueKey('step1'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Who are you\nsplitting with?',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.8,
                  color: const Color(0xFF0A0A0A),
                  height: 1.1,
                ),
              ),
              if (_selectedFriendIds.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  '${_selectedFriendIds.length} selected',
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF00C896),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ],
          ),
        ),
        Expanded(
          child: friendsAsync.when(
            data: (friends) {
              if (friends.isEmpty) {
                return const Center(
                  child: Text('No friends found. Add friends first.'),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                itemCount: friends.length,
                itemBuilder: (context, index) {
                  final friend = friends[index];
                  final isSelected = _selectedFriendIds.contains(friend.id);
                  return _FriendTile(
                    friend: friend,
                    isSelected: isSelected,
                    onTap: () {
                      setState(() {
                        if (isSelected) {
                          _selectedFriendIds.remove(friend.id!);
                        } else {
                          _selectedFriendIds.add(friend.id!);
                        }
                      });
                    },
                  );
                },
              );
            },
            loading: () => const Center(
              child: CircularProgressIndicator(color: Color(0xFF00C896)),
            ),
            error: (e, s) => Center(child: Text('Error: $e')),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    final perPerson = _amountController.text.isNotEmpty &&
            double.tryParse(_amountController.text) != null
        ? double.parse(_amountController.text) /
            (_selectedFriendIds.length + 1)
        : null;

    return SingleChildScrollView(
      key: const ValueKey('step2'),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => setState(() => _currentStep = 1),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: const Border.fromBorderSide(
                      BorderSide(color: Color(0xFFDDE8E4)),
                    ),
                  ),
                  child: const Icon(
                    LucideIcons.arrowLeft,
                    size: 18,
                    color: Color(0xFF0A0A0A),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Expense Details',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.6,
                  color: const Color(0xFF0A0A0A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),
          TextField(
            controller: _descController,
            decoration: const InputDecoration(
              labelText: 'Description',
              hintText: 'e.g. Dinner at The Table',
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _amountController,
            decoration: const InputDecoration(
              labelText: 'Total amount',
              hintText: '0.00',
              prefixText: '₹ ',
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: (v) => setState(() {}),
          ),
          const SizedBox(height: 28),
          Text(
            'SPLIT TYPE',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Colors.grey.shade500,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _SplitTypeButton(
                label: 'Equal',
                sublabel: 'Split evenly',
                isSelected: _splitType == 'EQUAL',
                icon: LucideIcons.equal,
                onTap: () => setState(() => _splitType = 'EQUAL'),
              ),
              const SizedBox(width: 12),
              _SplitTypeButton(
                label: 'Exact',
                sublabel: 'Custom amounts',
                isSelected: _splitType == 'EXACT',
                icon: LucideIcons.hash,
                onTap: () => setState(() => _splitType = 'EXACT'),
              ),
            ],
          ),
          if (_splitType == 'EQUAL' && perPerson != null) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF00C896).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: const Color(0xFF00C896).withValues(alpha: 0.20),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Per person',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      Text(
                        '${_selectedFriendIds.length + 1} people',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF00C896),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '₹${perPerson.toStringAsFixed(2)}',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF00C896),
                      letterSpacing: -1,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _FriendTile extends StatelessWidget {
  final Friend friend;
  final bool isSelected;
  final VoidCallback onTap;

  const _FriendTile({
    required this.friend,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final initial =
        friend.fullName.isNotEmpty ? friend.fullName[0].toUpperCase() : '?';
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF00C896).withValues(alpha: 0.08)
              : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF00C896).withValues(alpha: 0.40)
                : const Color(0xFFEEF2F0),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(0xFF00C896)
                    : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  initial,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: isSelected ? Colors.white : Colors.grey.shade600,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    friend.fullName,
                    style: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      letterSpacing: -0.2,
                      color: const Color(0xFF0A0A0A),
                    ),
                  ),
                  Text(
                    friend.email,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF888888),
                    ),
                  ),
                ],
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF00C896) : Colors.transparent,
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFF00C896)
                      : Colors.grey.shade300,
                  width: 1.5,
                ),
                borderRadius: BorderRadius.circular(7),
              ),
              child: isSelected
                  ? const Icon(Icons.check_rounded, size: 16, color: Colors.white)
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

class _SplitTypeButton extends StatelessWidget {
  final String label;
  final String sublabel;
  final bool isSelected;
  final IconData icon;
  final VoidCallback onTap;

  const _SplitTypeButton({
    required this.label,
    required this.sublabel,
    required this.isSelected,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFF00C896).withValues(alpha: 0.09)
                : Colors.white,
            border: Border.all(
              color: isSelected
                  ? const Color(0xFF00C896)
                  : const Color(0xFFDDE8E4),
              width: isSelected ? 1.5 : 1,
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                icon,
                color: isSelected ? const Color(0xFF00C896) : Colors.grey,
                size: 22,
              ),
              const SizedBox(height: 10),
              Text(
                label,
                style: GoogleFonts.spaceGrotesk(
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: isSelected
                      ? const Color(0xFF00C896)
                      : const Color(0xFF0A0A0A),
                ),
              ),
              Text(
                sublabel,
                style: TextStyle(
                  fontSize: 12,
                  color: isSelected
                      ? const Color(0xFF00C896).withValues(alpha: 0.7)
                      : Colors.grey.shade500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  final int currentStep;
  const _StepIndicator({required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
      child: Row(
        children: [
          _Step(number: 1, label: 'Friends', isActive: currentStep >= 1),
          Expanded(
            child: Container(
              height: 2,
              margin: const EdgeInsets.symmetric(horizontal: 8),
              decoration: BoxDecoration(
                color: currentStep >= 2
                    ? const Color(0xFF00C896)
                    : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ),
          _Step(number: 2, label: 'Details', isActive: currentStep >= 2),
        ],
      ),
    );
  }
}

class _Step extends StatelessWidget {
  final int number;
  final String label;
  final bool isActive;

  const _Step({required this.number, required this.label, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFF00C896) : Colors.grey.shade200,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Text(
              '$number',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: isActive ? Colors.white : Colors.grey.shade500,
              ),
            ),
          ),
        ),
        const SizedBox(width: 7),
        Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 13,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive ? const Color(0xFF0A0A0A) : Colors.grey.shade500,
          ),
        ),
      ],
    );
  }
}
