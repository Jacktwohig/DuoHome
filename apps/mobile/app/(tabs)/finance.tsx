import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: Replace with Supabase queries
const MOCK_ACCOUNTS = [
  { id: "1", name: "Chase Checking", type: "checking", balance: 4250.30, color: "#10B981" },
  { id: "2", name: "Ally Savings", type: "savings", balance: 18430.00, color: "#6366F1" },
  { id: "3", name: "Discover Card", type: "credit", balance: -1240.50, color: "#EF4444" },
];

const MOCK_TRANSACTIONS = [
  { id: "1", description: "Whole Foods Market", amount: -87.42, category: "Groceries", date: "May 8", who: "Alex" },
  { id: "2", description: "Netflix", amount: -15.99, category: "Entertainment", date: "May 7", who: "Jordan" },
  { id: "3", description: "Salary Deposit", amount: 3200.00, category: "Income", date: "May 6", who: "Alex" },
  { id: "4", description: "Target", amount: -134.20, category: "Shopping", date: "May 5", who: "Jordan" },
  { id: "5", description: "Con Edison", amount: -89.50, category: "Utilities", date: "May 4", who: "Alex" },
];

export default function FinanceScreen() {
  const totalBalance = MOCK_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);
  const monthlySpending = 2340;
  const monthlyBudget = 3000;
  const spendingPct = Math.round((monthlySpending / monthlyBudget) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Finance</Text>
          <Text style={styles.subtitle}>May 2025</Text>
        </View>

        {/* Net worth card */}
        <View style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Total Net Worth</Text>
          <Text style={styles.netWorthValue}>
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.netWorthSub}>Across {MOCK_ACCOUNTS.length} accounts</Text>
        </View>

        {/* Budget progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
          <View style={styles.budgetCard}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetSpent}>${monthlySpending.toLocaleString()}</Text>
              <Text style={styles.budgetTotal}>of ${monthlyBudget.toLocaleString()}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${spendingPct}%` as any,
                    backgroundColor: spendingPct > 80 ? "#EF4444" : "#10B981",
                  },
                ]}
              />
            </View>
            <Text style={styles.budgetPct}>{spendingPct}% of budget used</Text>
          </View>
        </View>

        {/* Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          {MOCK_ACCOUNTS.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={[styles.accountDot, { backgroundColor: account.color }]} />
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.type}</Text>
              </View>
              <Text
                style={[
                  styles.accountBalance,
                  { color: account.balance < 0 ? "#EF4444" : "#1C1917" },
                ]}
              >
                {account.balance < 0 ? "-" : ""}$
                {Math.abs(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent transactions */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {MOCK_TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.txLeft}>
                <Text style={styles.txDescription}>{tx.description}</Text>
                <View style={styles.txMeta}>
                  <Text style={styles.txCategory}>{tx.category}</Text>
                  <Text style={styles.txDot}>·</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                  <Text style={styles.txDot}>·</Text>
                  <Text style={styles.txWho}>{tx.who}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: tx.amount > 0 ? "#10B981" : "#1C1917" },
                ]}
              >
                {tx.amount > 0 ? "+" : ""}$
                {Math.abs(tx.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1917",
  },
  subtitle: {
    fontSize: 14,
    color: "#78716C",
    marginTop: 2,
  },
  netWorthCard: {
    backgroundColor: "#10B981",
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  netWorthLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  netWorthValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "white",
    marginTop: 4,
  },
  netWorthSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 12,
  },
  budgetCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 12,
  },
  budgetSpent: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1917",
  },
  budgetTotal: {
    fontSize: 14,
    color: "#78716C",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0EDEC",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  budgetPct: {
    fontSize: 12,
    color: "#78716C",
    marginTop: 8,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
  },
  accountType: {
    fontSize: 12,
    color: "#78716C",
    textTransform: "capitalize",
    marginTop: 1,
  },
  accountBalance: {
    fontSize: 15,
    fontWeight: "700",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  txLeft: {
    flex: 1,
    marginRight: 12,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
  },
  txMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  txCategory: {
    fontSize: 11,
    color: "#78716C",
  },
  txDot: {
    fontSize: 11,
    color: "#78716C",
  },
  txDate: {
    fontSize: 11,
    color: "#78716C",
  },
  txWho: {
    fontSize: 11,
    color: "#78716C",
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
});
