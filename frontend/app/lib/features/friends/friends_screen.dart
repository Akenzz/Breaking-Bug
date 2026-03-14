import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/models/app_models.dart';
import 'package:smartpay/shared/utils/api_config.dart';

class FriendsScreen extends ConsumerStatefulWidget {
  const FriendsScreen({super.key});

  @override
  ConsumerState<FriendsScreen> createState() => _FriendsScreenState();
}

class _FriendsScreenState extends ConsumerState<FriendsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  void _showAddFriendDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Friend'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Email or Phone',
            hintText: 'Enter friend\'s identifier',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final api = ref.read(apiServiceProvider);
              final res = await api.post(ApiConfig.friends + '/request', {'identifier': controller.text});
              if (context.mounted) {
                Navigator.pop(context);
                final decoded = jsonDecode(res.body);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(decoded['message'] ?? 'Request sent')),
                );
                ref.invalidate(pendingFriendRequestsProvider);
              }
            },
            child: const Text('Send Request'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final friendsAsync = ref.watch(friendsProvider);
    final pendingAsync = ref.watch(pendingFriendRequestsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Friends'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.userPlus, color: Color(0xFF00C896)),
            onPressed: _showAddFriendDialog,
          ),
          const SizedBox(width: 8),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.black,
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFF00C896),
          tabs: [
            Tab(text: 'Friends (${friendsAsync.value?.length ?? 0})'),
            Tab(text: 'Requests (${pendingAsync.value?.length ?? 0})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          const _FriendsTab(),
          const _RequestsTab(),
        ],
      ),
    );
  }
}

class _FriendsTab extends ConsumerWidget {
  const _FriendsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final friendsAsync = ref.watch(friendsProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search friends...',
              prefixIcon: const Icon(LucideIcons.search, size: 20),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
        Expanded(
          child: friendsAsync.when(
            data: (friends) {
              if (friends.isEmpty) {
                return const Center(child: Text('No friends yet'));
              }
              return ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: friends.length,
                separatorBuilder: (context, index) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final friend = friends[index];
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.grey.shade100,
                        child: Text(friend.fullName.isNotEmpty ? friend.fullName[0].toUpperCase() : '?'),
                      ),
                      title: Text(friend.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(friend.email, style: const TextStyle(fontSize: 12)),
                      trailing: const Icon(LucideIcons.chevronRight, size: 16),
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
}

class _RequestsTab extends ConsumerWidget {
  const _RequestsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingAsync = ref.watch(pendingFriendRequestsProvider);

    return pendingAsync.when(
      data: (requests) {
        if (requests.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(LucideIcons.userPlus, size: 48, color: Colors.grey.shade300),
                const SizedBox(height: 16),
                const Text('No pending requests', style: TextStyle(color: Colors.grey)),
              ],
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: requests.length,
          separatorBuilder: (context, index) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final req = requests[index];
            return Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.grey.shade100,
                  child: Text(req.requesterName.isNotEmpty ? req.requesterName[0].toUpperCase() : '?'),
                ),
                title: Text(req.requesterName, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(req.requesterPhone, style: const TextStyle(fontSize: 12)),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(LucideIcons.check, color: Colors.green),
                      onPressed: () async {
                        final api = ref.read(apiServiceProvider);
                        await api.post('${ApiConfig.friends}/${req.requestId}/accept', {});
                        ref.invalidate(pendingFriendRequestsProvider);
                        ref.invalidate(friendsProvider);
                      },
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, color: Colors.red),
                      onPressed: () async {
                        final api = ref.read(apiServiceProvider);
                        await api.post('${ApiConfig.friends}/${req.requestId}/reject', {});
                        ref.invalidate(pendingFriendRequestsProvider);
                      },
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Error: $e')),
    );
  }
}
