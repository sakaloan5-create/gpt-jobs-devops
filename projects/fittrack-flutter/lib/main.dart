import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/fitness_screen.dart';
import 'screens/custom_webview_screen.dart';
import 'screens/activation_screen.dart';
import 'services/remote_config_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const FitTrackApp());
}

class FitTrackApp extends StatelessWidget {
  const FitTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitTrack Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C63FF),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C63FF),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const AppEntry(),
    );
  }
}

class AppEntry extends StatefulWidget {
  const AppEntry({super.key});

  @override
  State<AppEntry> createState() => _AppEntryState();
}

class _AppEntryState extends State<AppEntry> {
  final RemoteConfigService _configService = RemoteConfigService();
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      await _configService.initialize();
      _configService.startPolling();
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $_error'),
            ],
          ),
        ),
      );
    }

    return ValueListenableBuilder<AppMode>(
      valueListenable: _configService.modeNotifier,
      builder: (context, mode, child) {
        switch (mode) {
          case AppMode.fitness:
            return FitnessScreen(
              onActivate: () => _showActivation(context),
            );
          case AppMode.custom:
            return const CustomWebViewScreen();
        }
      },
    );
  }

  void _showActivation(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ActivationScreen(
          onSuccess: () {
            Navigator.pop(context);
            _configService.switchToCustom();
          },
          onCancel: () => Navigator.pop(context),
        ),
      ),
    );
  }
}