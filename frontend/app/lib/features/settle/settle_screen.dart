import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:smartpay/shared/services/providers.dart';
import 'package:smartpay/shared/models/app_models.dart';

class SettleScreen extends ConsumerStatefulWidget {
  const SettleScreen({super.key});

  @override
  ConsumerState<SettleScreen> createState() => _SettleScreenState();
}

class _SettleScreenState extends ConsumerState<SettleScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final whoOwesMeAsync = ref.watch(whoOwesMeProvider);
    final whomIOweAsync = ref.watch(whomIOweProvider);

    final totalOwedToMe =
        whoOwesMeAsync.value?.fold(0.0, (sum, item) => sum + item.amount) ??
        0.0;
    final totalIOwe =
        whomIOweAsync.value?.fold(0.0, (sum, item) => sum + item.amount) ?? 0.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF2F7F5),
      body: Column(
        children: [
          // ── Dark stats hero ──────────────────────────────────────────
          Container(
            color: const Color(0xFF0A0A0A),
            child: SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
                    child: Text(
                      'Settle Up',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withValues(alpha: 0.45),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'OWED TO YOU',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white.withValues(alpha: 0.40),
                                  letterSpacing: 1.2,
                                ),
                              ),
                              const SizedBox(height: 6),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  '+₹${totalOwedToMe.toStringAsFixed(2)}',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 38,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFF00C896),
                                    letterSpacing: -1.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 48,
                          margin: const EdgeInsets.symmetric(horizontal: 20),
                          color: Colors.white.withValues(alpha: 0.10),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'YOU OWE',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white.withValues(alpha: 0.40),
                                  letterSpacing: 1.2,
                                ),
                              ),
                              const SizedBox(height: 6),
                              FittedBox(
                                fit: BoxFit.scaleDown,
                                alignment: Alignment.centerRight,
                                child: Text(
                                  '₹${totalIOwe.toStringAsFixed(2)}',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 38,
                                    fontWeight: FontWeight.w800,
                                    color: totalIOwe > 0
                                        ? const Color(0xFFFF5252)
                                        : Colors.white.withValues(alpha: 0.5),
                                    letterSpacing: -1.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Tab bar inside dark section
                  TabBar(
                    controller: _tabController,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white.withValues(alpha: 0.35),
                    indicatorColor: const Color(0xFF00C896),
                    indicatorSize: TabBarIndicatorSize.label,
                    dividerColor: Colors.white.withValues(alpha: 0.08),
                    labelStyle: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                    unselectedLabelStyle: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                    tabs: [
                      Tab(
                        text:
                            'Owes Me (${whoOwesMeAsync.value?.length ?? 0})',
                      ),
                      Tab(
                        text:
                            'I Owe (${whomIOweAsync.value?.length ?? 0})',
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── Tab content ──────────────────────────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _OwesMeTab(dataAsync: whoOwesMeAsync),
                _IOweTab(dataAsync: whomIOweAsync),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OwesMeTab extends StatelessWidget {
  final AsyncValue<List<WhoOwesMe>> dataAsync;
  const _OwesMeTab({required this.dataAsync});

  @override
  Widget build(BuildContext context) {
    return dataAsync.when(
      data: (data) {
        if (data.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF00C896).withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.check_rounded,
                    color: Color(0xFF00C896),
                    size: 32,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'All settled up!',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0A0A0A),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'No one owes you money right now.',
                  style: TextStyle(color: Color(0xFF888888), fontSize: 14),
                ),
              ],
            ),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          itemCount: data.length,
          itemBuilder: (context, index) {
            final item = data[index];
            return _OwesMeCard(item: item);
          },
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(color: Color(0xFF00C896)),
      ),
      error: (e, s) => Center(child: Text('Error: $e')),
    );
  }
}

class _OwesMeCard extends StatelessWidget {
  final WhoOwesMe item;
  const _OwesMeCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final initial = item.userName?.isNotEmpty == true
        ? item.userName![0].toUpperCase()
        : '?';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFF00C896).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(13),
              ),
              child: Center(
                child: Text(
                  initial,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF00C896),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.userName ?? 'Unknown',
                    style: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'owes you',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '+₹${item.amount.toStringAsFixed(2)}',
                  style: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF00C896),
                    fontSize: 16,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Reminder sent to ${item.userName ?? 'user'}!',
                        ),
                        backgroundColor: const Color(0xFF00C896),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: const Color(0xFF00C896).withValues(alpha: 0.4),
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Remind',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF00C896),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _IOweTab extends StatelessWidget {
  final AsyncValue<List<WhomIOwe>> dataAsync;
  const _IOweTab({required this.dataAsync});

  @override
  Widget build(BuildContext context) {
    return dataAsync.when(
      data: (data) {
        if (data.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF00C896).withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.check_rounded,
                    color: Color(0xFF00C896),
                    size: 32,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'You\'re clear!',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0A0A0A),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'You don\'t owe anyone right now.',
                  style: TextStyle(color: Color(0xFF888888), fontSize: 14),
                ),
              ],
            ),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          itemCount: data.length,
          itemBuilder: (context, index) {
            final item = data[index];
            return _IOweCard(item: item);
          },
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(color: Color(0xFF00C896)),
      ),
      error: (e, s) => Center(child: Text('Error: $e')),
    );
  }
}

class _IOweCard extends StatelessWidget {
  final WhomIOwe item;
  const _IOweCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final initial = item.userName?.isNotEmpty == true
        ? item.userName![0].toUpperCase()
        : '?';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFFFF5252).withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(13),
              ),
              child: Center(
                child: Text(
                  initial,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFFFF5252),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.userName ?? 'Unknown',
                    style: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '₹${item.amount.toStringAsFixed(2)}',
                    style: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFFF5252),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: () {
                context.push(
                  '/transfers/send?userId=${item.userId}&amount=${item.amount}',
                );
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF00C896),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'Pay Now',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
