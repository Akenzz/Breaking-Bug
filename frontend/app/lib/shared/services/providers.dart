import 'dart:convert';
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
