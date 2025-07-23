import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase/firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const KaratokenApp());
}

class KaratokenApp extends StatelessWidget {
  const KaratokenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Karatoken',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Karatoken')),
      body: const Center(child: Text('Welcome to Karatoken!')),
    );
  }
} 