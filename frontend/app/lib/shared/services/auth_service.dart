import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:smartpay/shared/services/api_service.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/utils/api_config.dart';

class AuthService {
  final ApiService _apiService = ApiService();
  final Ref _ref;

  AuthService(this._ref);

  Future<void> checkAuth() async {
    final token = await _apiService.getToken();
    if (token != null) {
      _ref.read(authStateProvider.notifier).setLoggedIn(true);
    }
  }

  Future<bool> login(String identifier, String password) async {
    try {
      print('DEBUG: Attempting login to ${ApiConfig.login}');
      print('DEBUG: identifier: $identifier');
      
      final response = await _apiService.post(ApiConfig.login, {
        'identifier': identifier,
        'password': password,
      });

      print('DEBUG: Login Response Status: ${response.statusCode}');
      print('DEBUG: Login Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true) {
          final token = decoded['data'];
          if (token != null) {
            await _apiService.saveToken(token);
            _ref.read(authStateProvider.notifier).setLoggedIn(true);
            print('DEBUG: Token saved successfully');
            return true;
          } else {
            print('DEBUG: Token data not found in successful response');
          }
        } else {
          print('DEBUG: Login failed: ${decoded['message']}');
        }
      }
      return false;
    } catch (e) {
      print('DEBUG: Login exception: $e');
      return false;
    }
  }

  Future<bool> register(String fullName, String email, String phoneNumber, String password) async {
    try {
      final response = await _apiService.post(ApiConfig.register, {
        'fullName': fullName,
        'email': email,
        'phoneNumber': phoneNumber,
        'password': password,
      });
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true) {
          final token = decoded['data'];
          if (token != null) {
            await _apiService.saveToken(token);
            _ref.read(authStateProvider.notifier).setLoggedIn(true);
            return true;
          }
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _apiService.deleteToken();
    _ref.read(authStateProvider.notifier).setLoggedIn(false);
  }
}
