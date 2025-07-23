import 'package:flutter/material.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _displayNameController = TextEditingController();
  final _singingLevelController = TextEditingController();
  final _walletAddressController = TextEditingController();
  String? _photoUrl;

  @override
  void dispose() {
    _displayNameController.dispose();
    _singingLevelController.dispose();
    _walletAddressController.dispose();
    super.dispose();
  }

  void _pickAvatar() async {
    // TODO: Implement image picker for avatar
  }

  void _saveProfile() {
    // TODO: Implement save logic using UserService
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile Setup')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            GestureDetector(
              onTap: _pickAvatar,
              child: CircleAvatar(
                radius: 40,
                backgroundImage: _photoUrl != null ? NetworkImage(_photoUrl!) : null,
                child: _photoUrl == null ? const Icon(Icons.person, size: 40) : null,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _displayNameController,
              decoration: const InputDecoration(labelText: 'Display Name'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _singingLevelController,
              decoration: const InputDecoration(labelText: 'Singing Level'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _walletAddressController,
              decoration: const InputDecoration(labelText: 'Crypto Wallet Address'),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _saveProfile,
              child: const Text('Save Profile'),
            ),
          ],
        ),
      ),
    );
  }
} 