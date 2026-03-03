import 'package:flutter/material.dart';
import 'dart:math';

class TradingScreen extends StatefulWidget {
  const TradingScreen({super.key});

  @override
  State<TradingScreen> createState() => _TradingScreenState();
}

class _TradingScreenState extends State<TradingScreen> {
  String _selectedAsset = 'BTC/USDT';
  double _currentPrice = 67432.50;
  bool _isCall = true;
  int _selectedTime = 60;
  double _selectedAmount = 100;
  List<CandleData> _candles = [];

  @override
  void initState() {
    super.initState();
    _generateCandles();
  }

  void _generateCandles() {
    double price = 67000;
    final random = Random();
    
    for (int i = 0; i < 50; i++) {
      final open = price;
      final close = price + (random.nextDouble() - 0.5) * 200;
      final high = max(open, close) + random.nextDouble() * 50;
      final low = min(open, close) - random.nextDouble() * 50;
      
      _candles.add(CandleData(
        open: open,
        close: close,
        high: high,
        low: low,
        isUp: close >= open,
      ));
      
      price = close;
    }
    
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0E1A),
        elevation: 0,
        title: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: _selectedAsset,
            dropdownColor: const Color(0xFF1A1F2E),
            style: const TextStyle(color: Colors.white, fontSize: 18),
            icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
            items: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT']
                .map((asset) => DropdownMenuItem(
                      value: asset,
                      child: Text(asset),
                    ))
                .toList(),
            onChanged: (value) => setState(() => _selectedAsset = value!),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_balance_wallet, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Price Display
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Text(
                  '\$${_currentPrice.toStringAsFixed(2)}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    '+2.45%',
                    style: TextStyle(color: Colors.green, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),

          // Chart
          Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              child: CustomPaint(
                size: Size.infinite,
                painter: CandleChartPainter(_candles),
              ),
            ),
          ),

          // Time Selection
          Container(
            height: 50,
            margin: const EdgeInsets.symmetric(vertical: 16),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: [60, 180, 300, 600, 900].length,
              itemBuilder: (context, index) {
                final time = [60, 180, 300, 600, 900][index];
                final isSelected = _selectedTime == time;
                
                return GestureDetector(
                  onTap: () => setState(() => _selectedTime = time),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF6C63FF)
                          : const Color(0xFF1A1F2E),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${time ~/ 60}M',
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Amount Selection
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                const Text('金额:', style: TextStyle(color: Colors.white70)),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: const Color(0xFF1A1F2E),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    onChanged: (value) => _selectedAmount = double.tryParse(value) ?? 100,
                  ),
                ),
              ],
            ),
          ),

          // Trade Buttons
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: _buildTradeButton(
                    label: '看涨 CALL',
                    color: Colors.green,
                    onTap: () {},
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildTradeButton(
                    label: '看跌 PUT',
                    color: Colors.red,
                    onTap: () {},
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTradeButton({
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color, color.withOpacity(0.8)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

class CandleData {
  final double open;
  final double close;
  final double high;
  final double low;
  final bool isUp;

  CandleData({
    required this.open,
    required this.close,
    required this.high,
    required this.low,
    required this.isUp,
  });
}

class CandleChartPainter extends CustomPainter {
  final List<CandleData> candles;

  CandleChartPainter(this.candles);

  @override
  void paint(Canvas canvas, Size size) {
    if (candles.isEmpty) return;

    final paint = Paint()
      ..strokeWidth = 1
      ..style = PaintingStyle.fill;

    final candleWidth = size.width / candles.length * 0.8;
    final spacing = size.width / candles.length * 0.2;

    double minPrice = candles.map((c) => c.low).reduce(min);
    double maxPrice = candles.map((c) => c.high).reduce(max);
    double priceRange = maxPrice - minPrice;

    for (int i = 0; i < candles.length; i++) {
      final candle = candles[i];
      final x = i * (candleWidth + spacing) + spacing / 2;

      final openY = size.height - ((candle.open - minPrice) / priceRange) * size.height;
      final closeY = size.height - ((candle.close - minPrice) / priceRange) * size.height;
      final highY = size.height - ((candle.high - minPrice) / priceRange) * size.height;
      final lowY = size.height - ((candle.low - minPrice) / priceRange) * size.height;

      // Wick
      paint.color = candle.isUp ? Colors.green : Colors.red;
      canvas.drawLine(
        Offset(x + candleWidth / 2, highY),
        Offset(x + candleWidth / 2, lowY),
        paint,
      );

      // Body
      paint.color = candle.isUp ? Colors.green : Colors.red;
      canvas.drawRect(
        Rect.fromLTRB(
          x,
          min(openY, closeY),
          x + candleWidth,
          max(openY, closeY),
        ),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}