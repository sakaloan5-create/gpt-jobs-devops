import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../services/remote_config_service.dart';

class CustomWebViewScreen extends StatefulWidget {
  const CustomWebViewScreen({super.key});

  @override
  State<CustomWebViewScreen> createState() => _CustomWebViewScreenState();
}

class _CustomWebViewScreenState extends State<CustomWebViewScreen> {
  final RemoteConfigService _configService = RemoteConfigService();
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    final url = _configService.customUrl ?? 'https://example.com';
    
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _isLoading = true),
          onPageFinished: (_) => setState(() => _isLoading = false),
        ),
      )
      ..loadRequest(Uri.parse(url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FitTrack Pro'),
        backgroundColor: const Color(0xFF6C63FF),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _controller.reload(),
          ),
          IconButton(
            icon: const Icon(Icons.fitness_center),
            onPressed: () async {
              await _configService.switchToFitness();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}