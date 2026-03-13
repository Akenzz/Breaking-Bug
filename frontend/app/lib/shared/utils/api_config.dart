class ApiConfig {
  static const String baseUrl = "https://smartpay-ivwr.onrender.com";
  
  // Auth
  static const String login = "$baseUrl/auth/login";
  static const String register = "$baseUrl/auth/register";
  
  // Dashboard
  static const String userMe = "$baseUrl/users/me";
  static const String dashboardChart = "$baseUrl/dashboard/chart";
  static const String dashboardSummary = "$baseUrl/dashboard/summary-detail";
  
  // Friends
  static const String friends = "$baseUrl/friends";
  static const String pendingFriends = "$baseUrl/friends/pending";
  
  // Groups
  static const String myGroups = "$baseUrl/groups/my";
  
  // Transactions & Ledger
  static const String transactions = "$baseUrl/ledger/my-transactions";
  static const String whoOwesMe = "$baseUrl/ledger/who-owes-me";
  static const String whomIOwe = "$baseUrl/ledger/whom-i-owe";
  
  // AI
  static const String parseBills = "$baseUrl/parse-bills";
  static const String analysis = "$baseUrl/analysis/me";
}
