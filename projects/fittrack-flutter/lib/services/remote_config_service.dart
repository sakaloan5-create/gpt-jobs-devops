import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

enum AppMode { fitness, custom }

class RemoteConfigService {
  static final RemoteConfigService _instance = RemoteConfigService._internal();
  factory RemoteConfigService() => _instance;
  RemoteConfigService._internal();

  // ⚠️ 部署后修改：替换为你的 Vercel 地址
  static const String _apiBaseUrl = 'https://protrade-admin-w9zx.vercel.app/api';
  static const String _deviceIdKey = 'device_id';
  static const String _screenModeKey = 'screen_mode';
  static const String _customUrlKey = 'custom_url';

  final ValueNotifier<AppMode> modeNotifier = ValueNotifier(AppMode.fitness);
  final ValueNotifier<String?> customUrlNotifier = ValueNotifier(null);
  
  Timer? _pollingTimer;
  String? _deviceId;
  Map<String, dynamic>? _config;

  Future<void> initialize() async {
    await _loadDeviceId();
    await _loadCustomUrl();
    await _fetchConfig();
  }

  Future<void> _loadDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    _deviceId = prefs.getString(_deviceIdKey);
    if (_deviceId == null) {
      _deviceId = 'D${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';
      await prefs.setString(_deviceIdKey, _deviceId!);
    }
  }

  Future<void> _loadCustomUrl() async {
    final prefs = await SharedPreferences.getInstance();
    final url = prefs.getString(_customUrlKey);
    customUrlNotifier.value = url;
  }

  Future<void> _fetchConfig() async {
    try {
      final response = await http.get(
        Uri.parse('$_apiBaseUrl/config'),
        headers: {'X-Device-ID': _deviceId!},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _config = data['config'];
        
        // 检查强制切换
        if (data['forceSwitch'] != null) {
          final forcedMode = data['forceSwitch'] as String;
          await _handleForcedSwitch(forcedMode);
        }
        
        // 更新自定义URL
        if (data['customUrl'] != null) {
          final url = data['customUrl'] as String;
          await _saveCustomUrl(url);
        }
        
        await _updateModeFromConfig();
      }
    } catch (e) {
      print('Error fetching config: $e');
    }
  }

  Future<void> _handleForcedSwitch(String mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_screenModeKey, mode);
    
    try {
      await http.post(
        Uri.parse('$_apiBaseUrl/device/ack-force'),
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': _deviceId!,
        },
        body: jsonEncode({'deviceId': _deviceId}),
      );
    } catch (e) {
      print('Error acknowledging force switch: $e');
    }
  }

  Future<void> _saveCustomUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_customUrlKey, url);
    customUrlNotifier.value = url;
  }

  Future<void> _updateModeFromConfig() async {
    final prefs = await SharedPreferences.getInstance();
    final savedMode = prefs.getString(_screenModeKey);
    
    if (savedMode == 'custom' || savedMode == 'trading') {
      modeNotifier.value = AppMode.custom;
    } else {
      modeNotifier.value = AppMode.fitness;
    }
  }

  void startPolling() {
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _fetchConfig();
    });
  }

  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  void setMode(AppMode mode) {
    modeNotifier.value = mode;
  }

  Future<bool> verifyPassword(String password) async {
    // 默认密码
    if (password == 'PRO2024' || password == 'admin') return true;
    // 检查服务器密码
    if (_config == null) return false;
    return _config!['adminPassword'] == password || _config!['secretCode'] == password;
  }

  Future<void> switchToCustom() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_screenModeKey, 'custom');
    modeNotifier.value = AppMode.custom;
    await _registerDevice();
  }

  Future<void> switchToFitness() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_screenModeKey, 'fitness');
    modeNotifier.value = AppMode.fitness;
    await _registerDevice();
  }

  Future<void> _registerDevice() async {
    try {
      await http.post(
        Uri.parse('$_apiBaseUrl/devices'),
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': _deviceId!,
        },
        body: jsonEncode({
          'deviceId': _deviceId,
          'screenMode': modeNotifier.value == AppMode.fitness ? 'fitness' : 'custom',
          'model': 'Flutter Android',
        }),
      );
    } catch (e) {
      print('Error registering device: $e');
    }
  }

  String? get deviceId => _deviceId;
  String? get customUrl => customUrlNotifier.value;
}

class ValueNotifier<T> extends ChangeNotifier {
  ValueNotifier(this._value);
  
  T _value;
  T get value => _value;
  
  set value(T newValue) {
    if (_value != newValue) {
      _value = newValue;
      notifyListeners();
    }
  }
}

class ChangeNotifier {
  final List<VoidCallback> _listeners = [];
  
  void addListener(VoidCallback listener) => _listeners.add(listener);
  void removeListener(VoidCallback listener) => _listeners.remove(listener);
  
  void notifyListeners() {
    for (final listener in _listeners) {
      listener();
    }
  }
}