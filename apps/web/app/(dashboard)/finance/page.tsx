"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Plus,
  Link2,
  CreditCard,
  Wallet,
  PiggyBank,
  BarChart3,
  X,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, percentage } from "@/lib/utils";

// TODO: Replace with Supabase queries
const MOCK_ACCOUNTS = [
  { id: "1", name: "Chase Checking", institution: "Chase", type: "checking", balance: 4250.30, currency: "USD" },
  { id: "2", name: "Ally Savings", institution: "Ally", type: "savings", balance: 18430.00, currency: "USD" },
  { id: "3", name: "Discover Card", institution: "Discover", type: "credit", balance: -1240.50, currency: "USD" },
];

const MOCK_TRANSACTIONS = [
  { id: "1", description: "Whole Foods Market", amount: -87.42, category: "Groceries", date: "2025-05-08", who: "Alex" },
  { id: "2", description: "Netflix", amount: -15.99, category: "Entertainment", date: "2025-05-07", who: "Jordan" },
  { id: "3", description: "Salary — Alex", amount: 3200.00, category: "Income", date: "2025-05-06", who: "Alex" },
  { id: "4", description: "Target", amount: -134.20, category: "Shopping", date: "2025-05-05", who: "Jordan" },
  { id: "5", description: "Con Edison", amount: -89.50, category: "Utilities", date: "2025-05-04", who: "Alex" },
  { id: "6", description: "Chipotle", amount: -26.80, category: "Dining", date: "2025-05-03", who: "Jordan" },
  { id: "7", description: "Salary — Jordan", amount: 2800.00, category: "Income", date: "2025-05-01", who: "Jordan" },
  { id: "8", description: "Amazon Prime", amount: -14.99, category: "Entertainment", date: "2025-04-30", who: "Alex" },
];

const SPENDING_BY_CATEGORY = [
  { name: "Housing", value: 1200, color: "#6366F1" },
  { name: "Groceries", value: 420, color: "#10B981" },
  { name: "Transport", value: 180, color: "#F59E0B" },
  { name: "Dining", value: 220, color: "#EF4444" },
  { name: "Entertainment", value: 150, color: "#8B5CF6" },
  { name: "Shopping", value: 280, color: "#F97316" },
  { name: "Utilities", value: 320, color: "#06B6D4" },
  { name: "Other", value: 110, color: "#64748B" },
];

const MONTHLY_TREND = [
  { month: "Dec", spending: 2800 },
  { month: "Jan", spending: 3100 },
  { month: "Feb", spending: 2600 },
  { month: "Mar", spending: 2950 },
  { month: "Apr", spending: 2700 },
  { month: "May", spending: 2340 },
];

const BUDGET_CATEGORIES = [
  { name: "Housing", allocated: 1500, spent: 1200, color: "#6366F1" },
  { name: "Groceries", allocated: 500, spent: 420, color: "#10B981" },
  { name: "Transport", allocated: 200, spent: 180, color: "#F59E0B" },
  { name: "Dining", allocated: 250, spent: 220, color: "#EF4444" },
  { name: "Entertainment", allocated: 150, spent: 150, color: "#8B5CF6" },
  { name: "Shopping", allocated: 300, spent: 280, color: "#F97316" },
];

const ACCOUNT_ICONS = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
};

export default function FinancePage() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showConnectBank, setShowConnectBank] = useState(false);
  const [newTx, setNewTx] = useState({
    description: "",
    amount: "",
    category: "Groceries",
    date: new Date().toISOString().split("T")[0],
    is_income: false,
  });

  const totalBalance = MOCK_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);
  const totalSpending = SPENDING_BY_CATEGORY.reduce((sum, c) => sum + c.value, 0);
  const totalBudget = BUDGET_CATEGORIES.reduce((sum, c) => sum + c.allocated, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Finance Overview</h2>
          <p className="text-sm text-[#78716C]">May 2025</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Link2 className="h-4 w-4" />}
            onClick={() => setShowConnectBank(true)}
          >
            Connect Bank
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddTransaction(true)}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Balance + trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-[#78716C]">Net Worth</p>
              <p className="text-2xl font-bold text-[#1C1917]">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
          <div className="space-y-3">
            {MOCK_ACCOUNTS.map((account) => {
              const Icon = ACCOUNT_ICONS[account.type as keyof typeof ACCOUNT_ICONS] || Wallet;
              return (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-[#E7E5E4]">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#78716C]" />
                    <div>
                      <p className="text-xs font-medium text-[#1C1917]">{account.name}</p>
                      <p className="text-xs text-[#78716C]">{account.institution}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${account.balance < 0 ? "text-red-500" : "text-[#1C1917]"}`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="mb-4">
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_TREND} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EDEC" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v)), "Spending"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #E7E5E4", fontSize: "12px" }}
                  />
                  <Bar dataKey="spending" fill="#E8526A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget overview */}
        <Card>
          <CardHeader className="mb-4 flex-row items-center justify-between">
            <CardTitle>Budget — May 2025</CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#1C1917]">{formatCurrency(totalSpending)}</span>
              <span className="text-xs text-[#78716C]">/ {formatCurrency(totalBudget)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {BUDGET_CATEGORIES.map((cat) => {
              const pct = percentage(cat.spent, cat.allocated);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-[#1C1917] font-medium">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#78716C]">{formatCurrency(cat.spent)}</span>
                      <span className="text-xs text-[#78716C]">/ {formatCurrency(cat.allocated)}</span>
                      {pct >= 100 && <Badge variant="error" className="text-xs">Over!</Badge>}
                    </div>
                  </div>
                  <Progress value={pct} color={pct >= 100 ? "#EF4444" : cat.color} size="sm" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Spending by category */}
        <Card>
          <CardHeader className="mb-4">
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[160px] w-[160px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SPENDING_BY_CATEGORY}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {SPENDING_BY_CATEGORY.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [formatCurrency(Number(v)), ""]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #E7E5E4", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {SPENDING_BY_CATEGORY.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-[#78716C] flex-1">{cat.name}</span>
                    <span className="text-xs font-medium text-[#1C1917]">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Badge variant="secondary" className="text-xs">{MOCK_TRANSACTIONS.length} transactions</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7E5E4]">
                  {["Description", "Category", "Date", "Who", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#78716C] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {MOCK_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1C1917]">{tx.description}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-xs">{tx.category}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#78716C]">{formatDate(tx.date, "MMM d")}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-xs">{tx.who}</Badge>
                    </td>
                    <td className={`px-5 py-3.5 text-sm font-semibold ${tx.amount > 0 ? "text-emerald-600" : "text-[#1C1917]"}`}>
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <Modal open={showAddTransaction} onClose={() => setShowAddTransaction(false)} title="Add Transaction" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Whole Foods Market"
            value={newTx.description}
            onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={newTx.amount}
              onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
            />
            <Input
              label="Date"
              type="date"
              value={newTx.date}
              onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
            />
          </div>
          <Select
            label="Category"
            value={newTx.category}
            onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
            options={[
              { value: "Groceries", label: "Groceries" },
              { value: "Dining", label: "Dining" },
              { value: "Transport", label: "Transport" },
              { value: "Entertainment", label: "Entertainment" },
              { value: "Shopping", label: "Shopping" },
              { value: "Utilities", label: "Utilities" },
              { value: "Housing", label: "Housing" },
              { value: "Income", label: "Income" },
              { value: "Other", label: "Other" },
            ]}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newTx.is_income}
              onChange={(e) => setNewTx({ ...newTx, is_income: e.target.checked })}
              className="h-4 w-4 rounded border-[#E7E5E4] accent-[#E8526A]"
            />
            <span className="text-sm text-[#1C1917]">This is income</span>
          </label>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddTransaction(false)}>Cancel</Button>
          <Button onClick={() => setShowAddTransaction(false)}>Add Transaction</Button>
        </ModalFooter>
      </Modal>

      {/* Connect Bank Modal */}
      <Modal open={showConnectBank} onClose={() => setShowConnectBank(false)} title="Connect Your Bank" size="md">
        <ModalBody>
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Link2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#1C1917] mb-2">Banking Integration</h3>
            <p className="text-sm text-[#78716C] mb-4">
              Plaid banking integration is coming soon! You&apos;ll be able to securely connect your bank accounts to automatically sync transactions.
            </p>
            <Badge variant="indigo">Coming Soon</Badge>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowConnectBank(false)}>Got it</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
