import 'package:flutter_test/flutter_test.dart';
import 'package:smartpay/app/app.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('App can launch and show landing screen', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: SmartPayApp(),
      ),
    );

    // Initial load might take a moment due to auth check
    await tester.pumpAndSettle();

    // Verify if "SmartPay" text is present (title or logo text)
    expect(find.textContaining('SmartPay'), findsWidgets);
  });
}
