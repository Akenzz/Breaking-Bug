import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:smartpay/app/router.dart';
import 'package:smartpay/shared/services/providers.dart';

class SmartPayApp extends ConsumerStatefulWidget {
  const SmartPayApp({super.key});

  @override
  ConsumerState<SmartPayApp> createState() => _SmartPayAppState();
}

class _SmartPayAppState extends ConsumerState<SmartPayApp> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await ref.read(authServiceProvider).checkAuth();
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'SmartPay',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00C896),
          primary: const Color(0xFF00C896),
          onPrimary: Colors.white,
          secondary: const Color(0xFF0A0A0A),
        ),
        textTheme: GoogleFonts.spaceGroteskTextTheme(),
        scaffoldBackgroundColor: const Color(0xFFF2F7F5),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          iconTheme: const IconThemeData(color: Color(0xFF0A0A0A)),
          titleTextStyle: GoogleFonts.spaceGrotesk(
            color: const Color(0xFF0A0A0A),
            fontSize: 18,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.3,
          ),
        ),
        cardTheme: const CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
          ),
          color: Colors.white,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0A0A0A),
            foregroundColor: Colors.white,
            minimumSize: const Size(0, 56),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            textStyle: GoogleFonts.spaceGrotesk(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFDDE8E4)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFDDE8E4)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF00C896), width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE53E3E)),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE53E3E), width: 1.5),
          ),
          filled: true,
          fillColor: Colors.white,
          labelStyle: const TextStyle(color: Color(0xFF888888), fontSize: 15),
          floatingLabelStyle: const TextStyle(color: Color(0xFF00C896), fontSize: 13),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
        tabBarTheme: TabBarThemeData(
          labelColor: const Color(0xFF0A0A0A),
          unselectedLabelColor: const Color(0xFF999999),
          indicatorColor: const Color(0xFF00C896),
          labelStyle: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700, fontSize: 13),
          unselectedLabelStyle: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w500, fontSize: 13),
          dividerColor: Colors.transparent,
          indicatorSize: TabBarIndicatorSize.label,
        ),
        dividerTheme: const DividerThemeData(
          color: Color(0xFFEEF2F0),
          thickness: 1,
          space: 0,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00C896),
          primary: const Color(0xFF00C896),
          brightness: Brightness.dark,
        ),
        textTheme: GoogleFonts.spaceGroteskTextTheme(ThemeData.dark().textTheme),
      ),
      themeMode: ThemeMode.light,
      routerConfig: router,
    );
  }
}
