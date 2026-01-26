import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'controllers/cart_controller.dart';
import 'controllers/auth_controller.dart';
import 'controllers/theme_controller.dart';
import 'screens/splash/splash_screen.dart';
import 'utils/theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Controllers
  Get.put(CartController());
  Get.put(AuthController());
  Get.put(ThemeController());

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeController = Get.find<ThemeController>();

    return Obx(() => GetMaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeController.themeMode,
      home: const SplashScreen(),
    ));
  }
}
