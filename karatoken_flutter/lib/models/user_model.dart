class AppUser {
  final String id;
  final String email;
  final String? displayName;
  final String? photoUrl;
  final String? phone;
  final int score;
  final int rewards;
  final String? singingLevel;
  final String? walletAddress;

  AppUser({
    required this.id,
    required this.email,
    this.displayName,
    this.photoUrl,
    this.phone,
    this.score = 0,
    this.rewards = 0,
    this.singingLevel,
    this.walletAddress,
  });

  factory AppUser.fromMap(Map<String, dynamic> map, String id) => AppUser(
        id: id,
        email: map['email'] ?? '',
        displayName: map['displayName'],
        photoUrl: map['photoUrl'],
        phone: map['phone'],
        score: map['score'] ?? 0,
        rewards: map['rewards'] ?? 0,
        singingLevel: map['singingLevel'],
        walletAddress: map['walletAddress'],
      );

  Map<String, dynamic> toMap() => {
        'email': email,
        'displayName': displayName,
        'photoUrl': photoUrl,
        'phone': phone,
        'score': score,
        'rewards': rewards,
        'singingLevel': singingLevel,
        'walletAddress': walletAddress,
      };
} 