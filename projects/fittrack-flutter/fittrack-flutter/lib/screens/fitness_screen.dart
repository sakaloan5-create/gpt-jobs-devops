import 'package:flutter/material.dart';
import 'dart:async';

class FitnessScreen extends StatefulWidget {
  final VoidCallback onActivate;
  
  const FitnessScreen({super.key, required this.onActivate});

  @override
  State<FitnessScreen> createState() => _FitnessScreenState();
}

class _FitnessScreenState extends State<FitnessScreen> {
  int _selectedIndex = 0;
  int _stepCount = 8432;
  int _secretTapCount = 0;
  Timer? _secretTimer;
  DateTime? _firstTapTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: IndexedStack(
          index: _selectedIndex,
          children: [
            _buildHomeTab(),
            _buildStatsTab(),
            _buildToolsTab(),
            _buildProfileTab(),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '首页'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: '统计'),
          BottomNavigationBarItem(icon: Icon(Icons.fitness_center), label: '工具'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '我的'),
        ],
      ),
    );
  }

  Widget _buildHomeTab() {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF6C63FF), Color(0xFF8B5CF6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'FitTrack Pro',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Icon(Icons.notifications_outlined, color: Colors.white),
                  ],
                ),
                const SizedBox(height: 30),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 200,
                      height: 200,
                      child: CircularProgressIndicator(
                        value: _stepCount / 10000,
                        strokeWidth: 12,
                        backgroundColor: Colors.white24,
                        valueColor: const AlwaysStoppedAnimation(Colors.white),
                      ),
                    ),
                    Column(
                      children: [
                        Text(
                          '$_stepCount',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Text(
                          '目标: 10,000步',
                          style: TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildStatCard('🔥', '486', '千卡'),
                    _buildStatCard('📍', '5.2', '公里'),
                    _buildStatCard('⏱️', '1.2', '小时'),
                  ],
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              const Text(
                '健康工具',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildToolCard(
                icon: Icons.calculate,
                title: 'BMI计算器',
                subtitle: '计算身体质量指数',
                color: Colors.blue,
              ),
              _buildToolCard(
                icon: Icons.water_drop,
                title: '喝水记录',
                subtitle: '追踪每日饮水量',
                color: Colors.cyan,
              ),
              _buildToolCard(
                icon: Icons.bedtime,
                title: '睡眠追踪',
                subtitle: '监测睡眠质量',
                color: Colors.purple,
              ),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: _handleSecretTap,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '打卡日历',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        '2026年2月',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String emoji, String value, String unit) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white24,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(unit, style: const TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }

  Widget _buildToolCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color),
        ),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }

  Widget _buildStatsTab() {
    return const Center(child: Text('统计页面'));
  }

  Widget _buildToolsTab() {
    return const Center(child: Text('工具页面'));
  }

  Widget _buildProfileTab() {
    return const Center(child: Text('个人中心'));
  }

  void _handleSecretTap() {
    final now = DateTime.now();
    
    if (_firstTapTime == null || now.difference(_firstTapTime!) > const Duration(seconds: 2)) {
      _secretTapCount = 1;
      _firstTapTime = now;
    } else {
      _secretTapCount++;
    }

    if (_secretTapCount >= 5) {
      _secretTapCount = 0;
      _firstTapTime = null;
      widget.onActivate();
    }
  }
}