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

    final ext = file.path.split('.').last.toLowerCase();
    final mimeTypes = {
      'jpg': MediaType('image', 'jpeg'),
      'jpeg': MediaType('image', 'jpeg'),
      'png': MediaType('image', 'png'),
      'gif': MediaType('image', 'gif'),
      'bmp': MediaType('image', 'bmp'),
      'webp': MediaType('image', 'webp'),
    };
    final contentType = mimeTypes[ext] ?? MediaType('image', 'jpeg');
    // image_picker converts HEIC/unsupported formats to JPEG content,
    // so force a .jpg filename so the backend extension check passes.
    final filename = mimeTypes.containsKey(ext)
        ? file.path.split('/').last
        : '${file.path.split('/').last.split('.').first}.jpg';

    final fileStream = http.ByteStream(file.openRead());
    final length = await file.length();

    request.files.add(http.MultipartFile(
      'file',
      fileStream,
      length,
      filename: filename,
      contentType: contentType,
    ));

    return await request.send();
  }

  Future<http.Response> recordPayment(Map<String, dynamic> data) async {
    return await post(ApiConfig.recordPayment, data);
  }

  Future<http.Response> evaluateRisk(Map<String, dynamic> data) async {
    return await post(ApiConfig.evaluateRisk, data);
  }

  Future<http.Response> reportUser(Map<String, dynamic> data) async {
    return await post(ApiConfig.reportUser, data);
  }

  Future<http.Response> scammerStatus(int userId) async {
    return await get('${ApiConfig.scammerStatus}/$userId');
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
