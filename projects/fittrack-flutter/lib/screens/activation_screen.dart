import 'package:flutter/material.dart';
import '../services/remote_config_service.dart';

class ActivationScreen extends StatefulWidget {
  final VoidCallback onSuccess;
  final VoidCallback onCancel;

  const ActivationScreen({
    super.key,
    required this.onSuccess,
    required this.onCancel,
  });

  @override
  State<ActivationScreen> createState() => _ActivationScreenState();
}

class _ActivationScreenState extends State<ActivationScreen> {
  final TextEditingController _passwordController = TextEditingController();
  final RemoteConfigService _configService = RemoteConfigService();
  bool _isLoading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: widget.onCancel,
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.admin_panel_settings,
                size: 64,
                color: Color(0xFF6C63FF),
              ),
              const SizedBox(height: 24),
              const Text(
                '管理员模式',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '输入密码切换到自定义页面',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 48),
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: '输入密码',
                  hintStyle: const TextStyle(color: Colors.white54),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.1),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  errorText: _error,
                  errorStyle: const TextStyle(color: Colors.redAccent),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _verifyPassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C63FF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
                        )
                      : const Text(
                          '确认',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: widget.onCancel,
                child: const Text(
                  '取消',
                  style: TextStyle(color: Colors.white54),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _verifyPassword() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final password = _passwordController.text.trim();
    
    // 默认密码
    if (password == 'PRO2024' || password == 'admin' || password == '888888') {
      await _configService.switchToCustom();
      setState(() => _isLoading = false);
      widget.onSuccess();
      return;
    }

    // 检查服务器密码
    final isValid = await _configService.verifyPassword(password);
    
    if (isValid) {
      await _configService.switchToCustom();
      setState(() => _isLoading = false);
      widget.onSuccess();
    } else {
      setState(() {
        _isLoading = false;
        _error = '密码错误';
      });
    }
  }

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }
}