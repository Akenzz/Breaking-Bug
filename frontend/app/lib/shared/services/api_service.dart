import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:smartpay/shared/utils/api_config.dart';

class ApiService {
  final _storage = const FlutterSecureStorage();

  Future<Map<String, String>> _getHeaders() async {
    String? token = await _storage.read(key: 'sp_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> get(String url) async {
    final headers = await _getHeaders();
    return await http.get(Uri.parse(url), headers: headers);
  }

  Future<http.Response> post(String url, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    return await http.post(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  Future<http.StreamedResponse> postMultipart(String url, File file) async {
    final request = http.MultipartRequest('POST', Uri.parse(url));
    
    String? token = await _storage.read(key: 'sp_token');
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    final fileStream = http.ByteStream(file.openRead());
    final length = await file.length();
    
    final multipartFile = http.MultipartFile(
      'file',
      fileStream,
      length,
      filename: file.path.split('/').last,
      contentType: MediaType('image', 'jpeg'), // Adjust based on extension if needed
    );

    request.files.add(multipartFile);
    return await request.send();
  }

  Future<http.Response> recordPayment(Map<String, dynamic> data) async {
    return await post(ApiConfig.recordPayment, data);
  }

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'sp_token', value: token);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: 'sp_token');
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'sp_token');
  }
}
