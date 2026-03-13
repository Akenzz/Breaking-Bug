import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class SplitScreen extends StatefulWidget {
  const SplitScreen({super.key});

  @override
  State<SplitScreen> createState() => _SplitScreenState();
}

class _SplitScreenState extends State<SplitScreen> {
  int _currentStep = 1;
  final List<String> _selectedFriends = [];
  final List<Map<String, String>> _friends = [
    {'name': 'Gandu', 'email': 'GanduGyaani@gmail.com', 'phone': '7619562239'},
    {'name': 'Akenzz', 'email': 'kiniamogh91@gmail.com', 'phone': '8073561046'},
    {'name': 'Tester', 'email': 'tester@mail.com', 'phone': '1234567890'},
    {'name': 'Berry', 'email': 'shivayveer6@gmail.com', 'phone': '0123456789'},
  ];

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
          onPressed: () {
            if (_currentStep == 1 && _selectedFriends.isNotEmpty) {
              setState(() => _currentStep = 2);
            } else if (_currentStep == 2) {
              Navigator.pop(context);
            }
          },
          child: Text(_currentStep == 1 ? 'Next' : 'Submit'),
        ),
      ),
    );
  }

  Widget _buildStep1() {
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
          child: ListView.builder(
            itemCount: _friends.length,
            itemBuilder: (context, index) {
              final friend = _friends[index];
              final isSelected = _selectedFriends.contains(friend['name']);
              return CheckboxListTile(
                value: isSelected,
                onChanged: (val) {
                  setState(() {
                    if (val!) {
                      _selectedFriends.add(friend['name']!);
                    } else {
                      _selectedFriends.remove(friend['name']!);
                    }
                  });
                },
                title: Text(friend['name']!),
                subtitle: Text(friend['email']!, style: const TextStyle(fontSize: 12)),
                secondary: CircleAvatar(child: Text(friend['name']![0])),
              );
            },
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
          const Text(
            'Expense Details',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          TextField(
            decoration: InputDecoration(
              labelText: 'DESCRIPTION',
              hintText: 'e.g. Dinner',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              floatingLabelBehavior: FloatingLabelBehavior.always,
            ),
          ),
          const SizedBox(height: 24),
          TextField(
            decoration: InputDecoration(
              labelText: 'TOTAL AMOUNT',
              hintText: '₹0.00',
              prefixText: '₹ ',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              floatingLabelBehavior: FloatingLabelBehavior.always,
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 32),
          const Text(
            'Split Type',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _SplitTypeButton(label: 'EQUAL', isSelected: true, icon: LucideIcons.equal),
              const SizedBox(width: 12),
              _SplitTypeButton(label: 'EXACT', isSelected: false, icon: LucideIcons.hash),
            ],
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

  const _SplitTypeButton({required this.label, required this.isSelected, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
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
    );
  }
}
