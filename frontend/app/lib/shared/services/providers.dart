import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:smartpay/shared/services/api_service.dart';
import 'package:smartpay/shared/services/auth_service.dart';
import 'package:smartpay/shared/models/app_models.dart';
import 'package:smartpay/shared/utils/api_config.dart';

final apiServiceProvider = Provider((ref) => ApiService());
final authServiceProvider = Provider((ref) => AuthService(ref));

class AuthState extends Notifier<bool> {
  @override
  bool build() => false;

  void setLoggedIn(bool value) {
    state = value;
  }
}

final authStateProvider = NotifierProvider<AuthState, bool>(() => AuthState());

final userProfileProvider = FutureProvider<User?>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.userMe);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true) {
      return User.fromJson(decoded['data']);
    }
  }
  return null;
});

final friendsProvider = FutureProvider<List<Friend>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.friends);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true && decoded['data'] != null) {
      final List<dynamic> data = decoded['data'];
      return data.map((item) => Friend.fromJson(item)).toList();
    }
  }
  return [];
});

final pendingFriendRequestsProvider = FutureProvider<List<FriendRequest>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.pendingFriends);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true && decoded['data'] != null) {
      final List<dynamic> data = decoded['data'];
      return data.map((item) => FriendRequest.fromJson(item)).toList();
    }
  }
  return [];
});

final groupsProvider = FutureProvider<List<Group>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.myGroups);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true && decoded['data'] != null) {
      final List<dynamic> data = decoded['data'];
      return data.map((item) => Group.fromJson(item)).toList();
    }
  }
  return [];
});

final groupDetailProvider = FutureProvider.family<GroupDetail?, String>((ref, groupId) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('${ApiConfig.baseUrl}/groups/$groupId/detail');
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true) {
      return GroupDetail.fromJson(decoded['data']);
    }
  }
  return null;
});

final transactionsProvider = FutureProvider<List<Transaction>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.transactions);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true && decoded['data'] != null) {
      final List<dynamic> data = decoded['data'];
      return data.map((item) => Transaction.fromJson(item)).toList();
    }
  }
  return [];
});

final dashboardSummaryProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.dashboardSummary);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true) {
      return decoded['data'] ?? {};
    }
  }
  return {};
});

final dashboardChartProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.dashboardChart);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true) {
      return decoded['data'] ?? {};
    }
  }
  return {};
});

final whoOwesMeProvider = FutureProvider<List<WhoOwesMe>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.whoOwesMe);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true && decoded['data'] != null) {
      final List<dynamic> data = decoded['data'];
      return data.map((item) => WhoOwesMe.fromJson(item)).toList();
    }
  }
  return [];
});

final whomIOweProvider = FutureProvider<List<WhomIOwe>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get(ApiConfig.whomIOwe);
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true && decoded['data'] != null) {
      final List<dynamic> data = decoded['data'];
      return data.map((item) => WhomIOwe.fromJson(item)).toList();
    }
  }
  return [];
});

final pendingTransfersProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('${ApiConfig.baseUrl}/transfers/pending-confirmations');
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true && decoded['data'] != null) {
      return List<Map<String, dynamic>>.from(decoded['data']);
    }
  }
  return [];
});

final transferHistoryProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final response = await api.get('${ApiConfig.baseUrl}/transfers/my');
  
  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    if (decoded['success'] == true && decoded['data'] != null) {
      return List<Map<String, dynamic>>.from(decoded['data']);
    }
  }
  return [];
});

final analysisProvider = FutureProvider<FinanceAnalysis?>((ref) async {
  debugPrint('[analysisProvider] Starting financial analysis request...');
  final api = ref.watch(apiServiceProvider);
  
  final transactions = await ref.watch(transactionsProvider.future);
  final user = await ref.watch(userProfileProvider.future);
  
  if (user == null || transactions.isEmpty) {
    return null;
  }

  try {
    final response = await api.post(ApiConfig.analysis, {
      'transactions': transactions.map((t) => t.toJson()).toList(),
      'username': user.fullName ?? user.email,
    });

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      if (decoded['success'] == true) {
        return FinanceAnalysis.fromJson(decoded);
      }
    }
  } catch (e) {
    debugPrint('[analysisProvider] Error: $e');
  }
  
  return null;
});
