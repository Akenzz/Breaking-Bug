class User {
  final int? id;
  final String? fullName;
  final String email;
  final String? phoneNumber;
  final String? upiId;
  final String? role;

  User({
    this.id,
    this.fullName,
    required this.email,
    this.phoneNumber,
    this.upiId,
    this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      fullName: json['fullName'],
      email: json['email'] ?? '',
      phoneNumber: json['phoneNumber'],
      upiId: json['upiId'],
      role: json['role'],
    );
  }
}

class Friend {
  final int? id;
  final String fullName;
  final String email;
  final String? phoneNumber;

  Friend({
    this.id,
    required this.fullName,
    required this.email,
    this.phoneNumber,
  });

  factory Friend.fromJson(Map<String, dynamic> json) {
    return Friend(
      id: json['id'],
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      phoneNumber: json['phoneNumber'],
    );
  }
}

class Group {
  final int? id;
  final String name;
  final String? description;
  final String? createdByName;
  final String? groupCode;

  Group({
    this.id,
    required this.name,
    this.description,
    this.createdByName,
    this.groupCode,
  });

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['id'],
      name: json['name'] ?? '',
      description: json['description'],
      createdByName: json['createdByName'],
      groupCode: json['groupCode'],
    );
  }
}

class Transaction {
  final int? id;
  final String description;
  final String? fromUserName;
  final String? toUserName;
  final String? createdAt;
  final double amount;
  final String type; // EXPENSE, INCOME
  final String? perspective;

  Transaction({
    this.id,
    required this.description,
    this.fromUserName,
    this.toUserName,
    this.createdAt,
    required this.amount,
    required this.type,
    this.perspective,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      description: json['description'] ?? '',
      fromUserName: json['fromUserName'],
      toUserName: json['toUserName'],
      createdAt: json['createdAt'],
      amount: (json['amount'] ?? 0.0).toDouble(),
      type: json['type'] ?? 'EXPENSE',
      perspective: json['perspective'],
    );
  }
}
