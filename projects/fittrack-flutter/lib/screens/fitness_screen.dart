import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';

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
  double _waterIntake = 1250;
  double _waterGoal = 2500;
  double _weight = 65.5;
  double _height = 175;
  List<DailyData> _weeklySteps = [];
  List<DailyData> _weeklyCalories = [];

  @override
  void initState() {
    super.initState();
    _generateMockData();
  }

  void _generateMockData() {
    final random = Random();
    for (int i = 6; i >= 0; i--) {
      _weeklySteps.add(DailyData(
        date: DateTime.now().subtract(Duration(days: i)),
        value: 5000 + random.nextInt(8000),
      ));
      _weeklyCalories.add(DailyData(
        date: DateTime.now().subtract(Duration(days: i)),
        value: 300 + random.nextInt(500),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          _buildHomeTab(),
          _buildStatsTab(),
          _buildToolsTab(),
          _buildProfileTab(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF6C63FF),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '首页'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: '统计'),
          BottomNavigationBarItem(icon: Icon(Icons.fitness_center), label: '工具'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '我的'),
        ],
      ),
    );
  }

  // ===== 首页 =====
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
              crossAxisAlignment: CrossAxisAlignment.start,
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
                const SizedBox(height: 8),
                const Text(
                  '今天也要保持运动！',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
                const SizedBox(height: 30),
                Center(
                  child: Stack(
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
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white24,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              '84%',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildStatCard('🔥', '${(0.04 * _stepCount).toInt()}', '千卡'),
                    _buildStatCard('📍', '${(_stepCount * 0.0007).toStringAsFixed(1)}', '公里'),
                    _buildStatCard('⏱️', '${(_stepCount / 7000).toStringAsFixed(1)}', '小时'),
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
              _buildSectionTitle('健康工具'),
              const SizedBox(height: 12),
              _buildToolCard(
                icon: Icons.calculate,
                title: 'BMI计算器',
                subtitle: '计算身体质量指数',
                color: Colors.blue,
                onTap: () => _showBMICalculator(),
              ),
              _buildToolCard(
                icon: Icons.water_drop,
                title: '喝水记录',
                subtitle: '今日 $_waterIntake / $_waterGoal ml',
                color: Colors.cyan,
                onTap: () => _showWaterTracker(),
              ),
              _buildToolCard(
                icon: Icons.bedtime,
                title: '睡眠追踪',
                subtitle: '昨晚睡眠 7.5 小时',
                color: Colors.purple,
                onTap: () {},
              ),
              _buildToolCard(
                icon: Icons.favorite,
                title: '心率监测',
                subtitle: '静息心率 72 bpm',
                color: Colors.red,
                onTap: () {},
              ),
              const SizedBox(height: 20),
              _buildSectionTitle('打卡日历'),
              const SizedBox(height: 12),
              _buildCalendarWidget(),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: _handleSecretTap,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Text(
                      'FitTrack Pro v1.0.0',
                      style: TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ),
                ),
              ),
            ]),
          ),
        ),
      ],
    );
  }

  // ===== 统计页面 =====
  Widget _buildStatsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '运动统计',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          _buildStatsCard(
            title: '本周步数',
            value: '${_weeklySteps.fold(0, (sum, d) => sum + d.value)}',
            unit: '步',
            icon: Icons.directions_walk,
            color: const Color(0xFF6C63FF),
          ),
          const SizedBox(height: 16),
          _buildStatsCard(
            title: '本周消耗',
            value: '${_weeklyCalories.fold(0, (sum, d) => sum + d.value)}',
            unit: '千卡',
            icon: Icons.local_fire_department,
            color: Colors.orange,
          ),
          const SizedBox(height: 24),
          _buildSectionTitle('步数趋势'),
          const SizedBox(height: 12),
          _buildBarChart(_weeklySteps, const Color(0xFF6C63FF)),
          const SizedBox(height: 24),
          _buildSectionTitle('热量趋势'),
          const SizedBox(height: 12),
          _buildBarChart(_weeklyCalories, Colors.orange),
          const SizedBox(height: 24),
          _buildSectionTitle('运动记录'),
          const SizedBox(height: 12),
          _buildExerciseList(),
        ],
      ),
    );
  }

  // ===== 工具页面 =====
  Widget _buildToolsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '健康工具',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          _buildToolGrid(),
          const SizedBox(height: 24),
          _buildSectionTitle('健康目标'),
          const SizedBox(height: 12),
          _buildGoalCard(
            title: '每日步数目标',
            current: _stepCount,
            goal: 10000,
            unit: '步',
            color: const Color(0xFF6C63FF),
          ),
          const SizedBox(height: 12),
          _buildGoalCard(
            title: '每日饮水目标',
            current: _waterIntake.toInt(),
            goal: _waterGoal.toInt(),
            unit: 'ml',
            color: Colors.cyan,
          ),
        ],
      ),
    );
  }

  // ===== 个人中心 =====
  Widget _buildProfileTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: const Color(0xFF6C63FF).withOpacity(0.2),
            child: const Icon(Icons.person, size: 50, color: Color(0xFF6C63FF)),
          ),
          const SizedBox(height: 16),
          const Text(
            'FitTrack User',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const Text(
            'ID: 88888888',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          _buildInfoCard(),
          const SizedBox(height: 24),
          _buildMenuItem(Icons.settings, '设置'),
          _buildMenuItem(Icons.notifications, '消息通知'),
          _buildMenuItem(Icons.share, '分享给好友'),
          _buildMenuItem(Icons.help_outline, '帮助与反馈'),
          _buildMenuItem(Icons.privacy_tip, '隐私政策'),
          _buildMenuItem(Icons.logout, '退出登录', color: Colors.red),
        ],
      ),
    );
  }

  // ===== UI组件 =====
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

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildToolCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    VoidCallback? onTap,
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
        onTap: onTap,
      ),
    );
  }

  Widget _buildCalendarWidget() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('2026年2月', style: TextStyle(fontWeight: FontWeight.bold)),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: () {},
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: () {},
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: const ['日', '一', '二', '三', '四', '五', '六']
                .map((d) => Text(d, style: TextStyle(color: Colors.grey)))
                .toList(),
          ),
          const SizedBox(height: 8),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 7,
            children: List.generate(28, (index) {
              final day = index + 1;
              final hasData = [3, 7, 12, 15, 20, 24, 28].contains(day);
              return Container(
                margin: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: hasData ? const Color(0xFF6C63FF).withOpacity(0.2) : null,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Text(
                  '$day',
                  style: TextStyle(
                    color: hasData ? const Color(0xFF6C63FF) : Colors.black87,
                    fontWeight: hasData ? FontWeight.bold : null,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard({
    required String title,
    required String value,
    required String unit,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 32),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(color: Colors.grey[600])),
              const SizedBox(height: 4),
              Row(
                children: [
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(unit, style: TextStyle(color: Colors.grey[600])),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBarChart(List<DailyData> data, Color color) {
    final maxValue = data.map((d) => d.value).reduce((a, b) => a > b ? a : b);
    
    return Container(
      height: 150,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: data.map((d) {
          return Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Container(
                width: 30,
                height: (d.value / maxValue) * 100,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${d.date.day}',
                style: const TextStyle(fontSize: 10, color: Colors.grey),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildExerciseList() {
    final exercises = [
      {'name': '晨跑', 'time': '07:30', 'calories': '320', 'duration': '30分钟'},
      {'name': '健走', 'time': '12:30', 'calories': '180', 'duration': '20分钟'},
      {'name': '瑜伽', 'time': '18:00', 'calories': '150', 'duration': '45分钟'},
    ];
    
    return Column(
      children: exercises.map((e) => Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.directions_run, color: Color(0xFF6C63FF)),
          ),
          title: Text(e['name']!),
          subtitle: Text('${e['time']} · ${e['duration']}'),
          trailing: Text(
            '${e['calories']}千卡',
            style: const TextStyle(
              color: Colors.orange,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildToolGrid() {
    final tools = [
      {'icon': Icons.calculate, 'name': 'BMI计算', 'color': Colors.blue},
      {'icon': Icons.water_drop, 'name': '喝水记录', 'color': Colors.cyan},
      {'icon': Icons.bedtime, 'name': '睡眠', 'color': Colors.purple},
      {'icon': Icons.favorite, 'name': '心率', 'color': Colors.red},
      {'icon': Icons.timer, 'name': '计时器', 'color': Colors.orange},
      {'icon': Icons.map, 'name': '运动轨迹', 'color': Colors.green},
      {'icon': Icons.restaurant, 'name': '饮食记录', 'color': Colors.teal},
      {'icon': Icons.local_fire_department, 'name': '卡路里', 'color': Colors.deepOrange},
    ];
    
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4,
      children: tools.map((t) => InkWell(
        onTap: () {
          if (t['name'] == 'BMI计算') _showBMICalculator();
          if (t['name'] == '喝水记录') _showWaterTracker();
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: (t['color'] as Color).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(t['icon'] as IconData, color: t['color'] as Color),
            ),
            const SizedBox(height: 8),
            Text(t['name'] as String, style: const TextStyle(fontSize: 12)),
          ],
        ),
      )).toList(),
    );
  }

  Widget _buildGoalCard({
    required String title,
    required int current,
    required int goal,
    required String unit,
    required Color color,
  }) {
    final progress = current / goal;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text('$current/$goal $unit', style: TextStyle(color: color)),
            ],
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[200],
            valueColor: AlwaysStoppedAnimation(color),
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildInfoItem('身高', '$_height', 'cm'),
          _buildInfoItem('体重', '$_weight', 'kg'),
          _buildInfoItem('BMI', (_weight / ((_height/100) * (_height/100))).toStringAsFixed(1), ''),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String label, String value, String unit) {
    return Column(
      children: [
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
        const SizedBox(height: 4),
        Row(
          children: [
            Text(
              value,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            if (unit.isNotEmpty)
              Text(unit, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          ],
        ),
      ],
    );
  }

  Widget _buildMenuItem(IconData icon, String title, {Color? color}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: color ?? Colors.grey[600]),
        title: Text(title, style: TextStyle(color: color)),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {},
      ),
    );
  }

  // ===== 功能方法 =====
  void _showBMICalculator() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('BMI计算器', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              TextField(
                decoration: const InputDecoration(
                  labelText: '身高 (cm)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (v) => setModalState(() => _height = double.tryParse(v) ?? _height),
              ),
              const SizedBox(height: 12),
              TextField(
                decoration: const InputDecoration(
                  labelText: '体重 (kg)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (v) => setModalState(() => _weight = double.tryParse(v) ?? _weight),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF6C63FF).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Text('您的BMI', style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 8),
                    Text(
                      (_weight / ((_height/100) * (_height/100))).toStringAsFixed(1),
                      style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF6C63FF)),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _getBMICategory(),
                      style: const TextStyle(color: Color(0xFF6C63FF)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getBMICategory() {
    final bmi = _weight / ((_height/100) * (_height/100));
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 24) return '正常';
    if (bmi < 28) return '偏胖';
    return '肥胖';
  }

  void _showWaterTracker() {
    showModalBottomSheet(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('喝水记录', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 150,
                    height: 150,
                    child: CircularProgressIndicator(
                      value: _waterIntake / _waterGoal,
                      strokeWidth: 12,
                      backgroundColor: Colors.grey[200],
                      valueColor: const AlwaysStoppedAnimation(Colors.cyan),
                    ),
                  ),
                  Column(
                    children: [
                      Text(
                        '${(_waterIntake / _waterGoal * 100).toInt()}%',
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                      ),
                      Text('${_waterIntake.toInt()}/$_waterGoal ml', style: TextStyle(color: Colors.grey[600])),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [200, 250, 500].map((ml) => ElevatedButton(
                  onPressed: () {
                    setModalState(() => _waterIntake = (_waterIntake + ml).clamp(0, _waterGoal * 1.5));
                  },
                  child: Text('+${ml}ml'),
                )).toList(),
              ),
            ],
          ),
        ),
      ),
    );
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

class DailyData {
  final DateTime date;
  final int value;
  
  DailyData({required this.date, required this.value});
}