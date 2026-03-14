import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:smartpay/features/home/landing_screen.dart';
import 'package:smartpay/features/auth/login_screen.dart';
import 'package:smartpay/features/auth/signup_screen.dart';
import 'package:smartpay/features/dashboard/dashboard_screen.dart';
import 'package:smartpay/features/analysis/analysis_screen.dart';
import 'package:smartpay/features/profile/profile_screen.dart';
import 'package:smartpay/features/transactions/transactions_screen.dart';
import 'package:smartpay/features/friends/friends_screen.dart';
import 'package:smartpay/features/groups/groups_screen.dart';
import 'package:smartpay/features/groups/group_detail_screen.dart';
import 'package:smartpay/features/split/split_screen.dart';
import 'package:smartpay/features/settle/settle_screen.dart';
import 'package:smartpay/features/bills/bills_screen.dart';
import 'package:smartpay/features/pay/pay_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smartpay/shared/services/providers.dart';

import 'package:smartpay/features/payments/payments_hub_screen.dart';
import 'package:smartpay/features/payments/pending_confirmations_screen.dart';
import 'package:smartpay/features/payments/transfer_history_screen.dart';
import 'package:smartpay/features/payments/send_transfer_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final isLoggedIn = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isPublicPage = state.uri.path == '/' || state.uri.path == '/login' || state.uri.path == '/signup';
      
      if (!isLoggedIn) {
        return isPublicPage ? null : '/';
      }

      if (isPublicPage) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const LandingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignUpScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) {
          return MainShell(child: child);
        },
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/analysis',
            builder: (context, state) => const AnalysisScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/transactions',
            builder: (context, state) => const TransactionsScreen(),
          ),
          GoRoute(
            path: '/pay',
            builder: (context, state) => const PayScreen(),
          ),
          GoRoute(
            path: '/split',
            builder: (context, state) => const SplitScreen(),
          ),
          GoRoute(
            path: '/groups',
            builder: (context, state) => const GroupsScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) => GroupDetailScreen(
                  groupId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/settle',
            builder: (context, state) => const SettleScreen(),
          ),
          GoRoute(
            path: '/bills',
            builder: (context, state) => const BillsScreen(),
          ),
          GoRoute(
            path: '/friends',
            builder: (context, state) => const FriendsScreen(),
          ),
          GoRoute(
            path: '/payments',
            builder: (context, state) => const PaymentsHubScreen(),
          ),
          GoRoute(
            path: '/transfers/pending',
            builder: (context, state) => const PendingConfirmationsScreen(),
          ),
          GoRoute(
            path: '/transfers/history',
            builder: (context, state) => const TransferHistoryScreen(),
          ),
          GoRoute(
            path: '/transfers/send',
            builder: (context, state) {
              final userId = state.uri.queryParameters['userId'];
              final amount = state.uri.queryParameters['amount'];
              return SendTransferScreen(userId: userId, amount: amount);
            },
          ),
        ],
      ),
    ],
  );
});

class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _getCurrentIndex(location),
        onTap: (index) {
          switch (index) {
            case 0:
              context.go('/dashboard');
            case 1:
              context.go('/analysis');
            case 2:
              context.go('/profile');
          }
        },
        selectedItemColor: const Color(0xFF00C896),
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.layoutGrid),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.barChart3),
            label: 'Analysis',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.user),
            label: 'Account',
          ),
        ],
      ),
    );
  }

  int _getCurrentIndex(String location) {
    if (location.startsWith('/dashboard')) return 0;
    if (location.startsWith('/analysis')) return 1;
    if (location.startsWith('/profile')) return 2;
    return 0;
  }
}
