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
  final TextEditingController _codeController = TextEditingController();
  final RemoteConfigService _configService = RemoteConfigService();
  bool _isLoading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.lock_outline,
                size: 64,
                color: Color(0xFF6C63FF),
              ),
              const SizedBox(height: 24),
              const Text(
                'ProTrade',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '控制中心',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 48),
              TextField(
                controller: _codeController,
                obscureText: true,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: '输入管理员密码',
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
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _verifyCode,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C63FF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
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
                          '登录',
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
                  '返回',
                  style: TextStyle(color: Colors.white54),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _verifyCode() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final code = _codeController.text.trim();
    
    // Check default codes
    if (code == 'PRO2024' || code == 'trading') {
      await _configService.activateTrading();
      setState(() => _isLoading = false);
      widget.onSuccess();
      return;
    }

    // Check server-side code
    final isValid = await _configService.verifyActivationCode(code);
    
    if (isValid) {
      await _configService.activateTrading();
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
    _codeController.dispose();
    super.dispose();
  }
}