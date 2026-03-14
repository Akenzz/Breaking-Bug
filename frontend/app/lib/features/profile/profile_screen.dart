import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/utils/api_config.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  void _showEditUpiDialog(BuildContext context, WidgetRef ref, String? currentUpi) {
    final controller = TextEditingController(text: currentUpi);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Update UPI ID'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'UPI ID',
            hintText: 'yourname@bank',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final api = ref.read(apiServiceProvider);
              final res = await api.post('${ApiConfig.baseUrl}/users/upi', {'upiId': controller.text});
              if (context.mounted) {
                Navigator.pop(context);
                final decoded = jsonDecode(res.body);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(decoded['message'] ?? 'UPI ID updated')),
                );
                ref.invalidate(userProfileProvider);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Account'),
      ),
      body: userAsync.when(
        data: (user) {
          if (user == null) {
            return const Center(child: Text('User not found'));
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: const Color(0xFF00C896),
                  child: Text(
                    user.fullName != null && user.fullName!.isNotEmpty ? user.fullName![0].toUpperCase() : '?',
                    style: const TextStyle(fontSize: 40, color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  user.fullName ?? 'User',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                Text(
                  '#${user.id ?? 0} · ${user.role ?? "User"}',
                  style: const TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 32),
                _ProfileItem(
                  icon: LucideIcons.mail,
                  label: 'Email',
                  value: user.email,
                ),
                _ProfileItem(
                  icon: LucideIcons.phone,
                  label: 'Phone Number',
                  value: user.phoneNumber ?? 'Not set',
                ),
                _ProfileItem(
                  icon: LucideIcons.qrCode,
                  label: 'UPI ID',
                  value: user.upiId ?? 'Not set',
                  onEdit: () => _showEditUpiDialog(context, ref, user.upiId),
                ),
                const SizedBox(height: 32),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.shieldCheck, color: Color(0xFF00C896)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Secure Session',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              Text(
                                'JWT token · httpOnly cookie',
                                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                OutlinedButton(
                  onPressed: () async {
                    await ref.read(authServiceProvider).logout();
                    if (context.mounted) {
                      context.go('/');
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Sign Out'),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _ProfileItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onEdit;

  const _ProfileItem({
    required this.icon,
    required this.label,
    required this.value,
    this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
                Text(
                  value,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          if (onEdit != null)
            IconButton(
              icon: const Icon(LucideIcons.pencil, size: 16),
              onPressed: onEdit,
            ),
        ],
      ),
    );
  }
}
