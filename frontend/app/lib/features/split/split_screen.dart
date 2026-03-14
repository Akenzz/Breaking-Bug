import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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

  Future<void> _handleSplit() async {
    if (_descController.text.isEmpty || _amountController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
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
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Split created successfully!')));
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(decoded['message'] ?? 'Failed to create split')));
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Split Expense'),
      ),
      body: _currentStep == 1 ? _buildStep1() : _buildStep2(),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade100)),
        ),
        child: ElevatedButton(
          onPressed: _isSubmitting ? null : () {
            if (_currentStep == 1) {
              if (_selectedFriendIds.isNotEmpty) {
                setState(() => _currentStep = 2);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Select at least one friend')));
              }
            } else {
              _handleSplit();
            }
          },
          child: _isSubmitting 
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Text(_currentStep == 1 ? 'Next' : 'Create Split'),
        ),
      ),
    );
  }

  Widget _buildStep1() {
    final friendsAsync = ref.watch(friendsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.all(24.0),
          child: Text(
            'Who are you splitting with?',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        Expanded(
          child: friendsAsync.when(
            data: (friends) {
              if (friends.isEmpty) return const Center(child: Text('No friends found. Add friends first.'));
              return ListView.builder(
                itemCount: friends.length,
                itemBuilder: (context, index) {
                  final friend = friends[index];
                  final isSelected = _selectedFriendIds.contains(friend.id);
                  return CheckboxListTile(
                    value: isSelected,
                    onChanged: (val) {
                      setState(() {
                        if (val!) {
                          _selectedFriendIds.add(friend.id!);
                        } else {
                          _selectedFriendIds.remove(friend.id!);
                        }
                      });
                    },
                    title: Text(friend.fullName),
                    subtitle: Text(friend.email, style: const TextStyle(fontSize: 12)),
                    secondary: CircleAvatar(
                      backgroundColor: isSelected ? const Color(0xFF00C896) : Colors.grey.shade200,
                      child: Text(friend.fullName.isNotEmpty ? friend.fullName[0].toUpperCase() : '?', 
                        style: TextStyle(color: isSelected ? Colors.white : Colors.black)),
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, s) => Center(child: Text('Error: $e')),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(onPressed: () => setState(() => _currentStep = 1), icon: const Icon(LucideIcons.arrowLeft)),
              const Text(
                'Expense Details',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _descController,
            decoration: InputDecoration(
              labelText: 'DESCRIPTION',
              hintText: 'e.g. Dinner',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              floatingLabelBehavior: FloatingLabelBehavior.always,
            ),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _amountController,
            decoration: InputDecoration(
              labelText: 'TOTAL AMOUNT',
              hintText: '0.00',
              prefixText: '₹ ',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              floatingLabelBehavior: FloatingLabelBehavior.always,
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
          const SizedBox(height: 32),
          const Text(
            'Split Type',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _SplitTypeButton(
                label: 'EQUAL', 
                isSelected: _splitType == 'EQUAL', 
                icon: LucideIcons.equal,
                onTap: () => setState(() => _splitType = 'EQUAL'),
              ),
              const SizedBox(width: 12),
              _SplitTypeButton(
                label: 'EXACT', 
                isSelected: _splitType == 'EXACT', 
                icon: LucideIcons.hash,
                onTap: () => setState(() => _splitType = 'EXACT'),
              ),
            ],
          ),
          if (_splitType == 'EQUAL' && _amountController.text.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 24),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF00C896).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Per person (${_selectedFriendIds.length + 1})', style: const TextStyle(fontWeight: FontWeight.w500)),
                    Text('₹${(double.parse(_amountController.text) / (_selectedFriendIds.length + 1)).toStringAsFixed(2)}', 
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _SplitTypeButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final IconData icon;
  final VoidCallback onTap;

  const _SplitTypeButton({required this.label, required this.isSelected, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF00C896).withValues(alpha: 0.1) : Colors.white,
            border: Border.all(color: isSelected ? const Color(0xFF00C896) : Colors.grey.shade200),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? const Color(0xFF00C896) : Colors.grey),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isSelected ? const Color(0xFF00C896) : Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
