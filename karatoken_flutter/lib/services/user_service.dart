import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class UserService {
  final _users = FirebaseFirestore.instance.collection('users');

  Future<void> createUserProfile(AppUser user) async {
    await _users.doc(user.id).set(user.toMap(), SetOptions(merge: true));
  }

  Future<void> updateUserProfile(String userId, Map<String, dynamic> data) async {
    await _users.doc(userId).update(data);
  }

  Future<AppUser?> getUserProfile(String userId) async {
    final doc = await _users.doc(userId).get();
    if (doc.exists) {
      return AppUser.fromMap(doc.data()!, doc.id);
    }
    return null;
  }
} 