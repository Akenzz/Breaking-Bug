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

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'createdAt': createdAt ?? '',
      'description': description,
      'fromUserName': fromUserName ?? '',
      'toUserName': toUserName ?? '',
    };
  }
}

class FinanceAnalysis {
  final int healthScore;
  final String healthGrade;
  final HealthBreakdown healthBreakdown;
  final HealthStats healthStats;
  final PredictionResult prediction;
  final List<dynamic> anomalies;
  final bool anomalySkipped;
  final Map<String, double> categoryTotals;
  final List<TopRecipient> topRecipients;
  final List<String> insights;

  FinanceAnalysis({
    required this.healthScore,
    required this.healthGrade,
    required this.healthBreakdown,
    required this.healthStats,
    required this.prediction,
    required this.anomalies,
    required this.anomalySkipped,
    required this.categoryTotals,
    required this.topRecipients,
    required this.insights,
  });

  factory FinanceAnalysis.fromJson(Map<String, dynamic> json) {
    return FinanceAnalysis(
      healthScore: json['health_score'] ?? 0,
      healthGrade: json['health_grade'] ?? '',
      healthBreakdown: HealthBreakdown.fromJson(json['health_breakdown'] ?? {}),
      healthStats: HealthStats.fromJson(json['health_stats'] ?? {}),
      prediction: PredictionResult.fromJson(json['prediction'] ?? {}),
      anomalies: json['anomalies'] ?? [],
      anomalySkipped: json['anomaly_skipped'] ?? false,
      categoryTotals: (json['category_totals'] as Map<String, dynamic>? ?? {})
          .map((k, v) => MapEntry(k, (v as num).toDouble())),
      topRecipients: (json['top_recipients'] as List? ?? [])
          .map((e) => TopRecipient.fromJson(e))
          .toList(),
      insights: List<String>.from(json['insights'] ?? []),
    );
  }
}

class HealthBreakdown {
  final HealthItem consistency;
  final HealthItem spikeControl;
  final HealthItem categoryDiversity;
  final HealthItem anomalyPenalty;

  HealthBreakdown({
    required this.consistency,
    required this.spikeControl,
    required this.categoryDiversity,
    required this.anomalyPenalty,
  });

  factory HealthBreakdown.fromJson(Map<String, dynamic> json) {
    return HealthBreakdown(
      consistency: HealthItem.fromJson(json['consistency'] ?? {}),
      spikeControl: HealthItem.fromJson(json['spike_control'] ?? {}),
      categoryDiversity: HealthItem.fromJson(json['category_diversity'] ?? {}),
      anomalyPenalty: HealthItem.fromJson(json['anomaly_penalty'] ?? {}),
    );
  }
}

class HealthItem {
  final int score;
  final int max;

  HealthItem({required this.score, required this.max});

  factory HealthItem.fromJson(Map<String, dynamic> json) {
    return HealthItem(
      score: json['score'] ?? 0,
      max: json['max'] ?? 0,
    );
  }
}

class HealthStats {
  final double totalSpending;
  final double totalIncome;
  final double netCashFlow;
  final double averageTransaction;
  final int transactionCount;
  final int outgoingCount;
  final int incomingCount;

  HealthStats({
    required this.totalSpending,
    required this.totalIncome,
    required this.netCashFlow,
    required this.averageTransaction,
    required this.transactionCount,
    required this.outgoingCount,
    required this.incomingCount,
  });

  factory HealthStats.fromJson(Map<String, dynamic> json) {
    return HealthStats(
      totalSpending: (json['total_spending'] ?? 0.0).toDouble(),
      totalIncome: (json['total_income'] ?? 0.0).toDouble(),
      netCashFlow: (json['net_cash_flow'] ?? 0.0).toDouble(),
      averageTransaction: (json['average_transaction'] ?? 0.0).toDouble(),
      transactionCount: json['transaction_count'] ?? 0,
      outgoingCount: json['outgoing_count'] ?? 0,
      incomingCount: json['incoming_count'] ?? 0,
    );
  }
}

class PredictionResult {
  final double predictedNextAmount;
  final String method;
  final String trend;
  final double modelConfidence;

  PredictionResult({
    required this.predictedNextAmount,
    required this.method,
    required this.trend,
    required this.modelConfidence,
  });

  factory PredictionResult.fromJson(Map<String, dynamic> json) {
    return PredictionResult(
      predictedNextAmount: (json['predicted_next_amount'] ?? 0.0).toDouble(),
      method: json['method'] ?? '',
      trend: json['trend'] ?? '',
      modelConfidence: (json['model_confidence_r2'] ?? 0.0).toDouble(),
    );
  }
}

class TopRecipient {
  final String recipient;
  final double totalAmount;
  final int transactionCount;
  final String primaryCategory;

  TopRecipient({
    required this.recipient,
    required this.totalAmount,
    required this.transactionCount,
    required this.primaryCategory,
  });

  factory TopRecipient.fromJson(Map<String, dynamic> json) {
    return TopRecipient(
      recipient: json['recipient'] ?? '',
      totalAmount: (json['total_amount'] ?? 0.0).toDouble(),
      transactionCount: json['transaction_count'] ?? 0,
      primaryCategory: json['primary_category'] ?? '',
    );
  }
}

class ParsedBill {
  final String merchant;
  final String date;
  final double total;
  final String currency;
  final String category;
  final List<BillItem> items;

  ParsedBill({
    required this.merchant,
    required this.date,
    required this.total,
    required this.currency,
    required this.category,
    required this.items,
  });

  factory ParsedBill.fromJson(Map<String, dynamic> json) {
    return ParsedBill(
      merchant: json['merchant'] ?? '',
      date: json['date'] ?? '',
      total: (json['total'] ?? 0.0).toDouble(),
      currency: json['currency'] ?? 'INR',
      category: json['category'] ?? '',
      items: (json['items'] as List? ?? [])
          .map((e) => BillItem.fromJson(e))
          .toList(),
    );
  }
}

class BillItem {
  final String name;
  final double price;

  BillItem({required this.name, required this.price});

  factory BillItem.fromJson(Map<String, dynamic> json) {
    return BillItem(
      name: json['name'] ?? '',
      price: (json['price'] ?? 0.0).toDouble(),
    );
  }
}

class FraudRiskResponse {
  final double fraudRiskScore;
  final String riskLevel;
  final bool isBlocked;
  final String message;
  final List<String> riskReasons;

  FraudRiskResponse({
    required this.fraudRiskScore,
    required this.riskLevel,
    required this.isBlocked,
    required this.message,
    required this.riskReasons,
  });

  factory FraudRiskResponse.fromJson(Map<String, dynamic> json) {
    return FraudRiskResponse(
      fraudRiskScore: (json['fraud_risk_score'] ?? 0.0).toDouble(),
      riskLevel: json['risk_level'] ?? 'SAFE',
      isBlocked: json['is_blocked'] ?? false,
      message: json['message'] ?? '',
      riskReasons: List<String>.from(json['risk_reasons'] ?? []),
    );
  }
}
