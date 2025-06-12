"use client";

import { ArrowDownLeft, ArrowUpRight, CreditCard } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Colors, Typography } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import type { ApiTransaction, ApiWallet } from "../../types/api";

export default function WalletScreen() {
  const { user, refreshUser } = useAuth();
  const [wallet, setWallet] = useState<ApiWallet | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const data = await apiService.getWallet();
      setWallet(data);
      await refreshUser(); // Update user balance
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch wallet data");
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  const formatAmount = (amount: number) => {
    return `₦${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleTopUp = async () => {
    const amount = Number.parseFloat(topUpAmount);

    if (!amount || amount < 1000) {
      Alert.alert("Error", "Minimum top-up amount is ₦1,000");
      return;
    }

    if (amount > 500000) {
      Alert.alert("Error", "Maximum top-up amount is ₦500,000");
      return;
    }

    if (!user?.email) {
      Alert.alert("Error", "User email not found");
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.initiatePayment(amount, user.email);

      // Open Paystack payment URL
      const supported = await Linking.canOpenURL(response.authorization_url);
      if (supported) {
        await Linking.openURL(response.authorization_url);
        setShowTopUp(false);
        setTopUpAmount("");

        Alert.alert(
          "Payment Initiated",
          "Complete your payment in the browser. Your wallet will be updated automatically.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Cannot open payment URL");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawData.amount);

    if (!amount || amount < 1000) {
      Alert.alert("Error", "Minimum withdrawal amount is ₦1,000");
      return;
    }

    if (amount > balance) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    if (
      !withdrawData.bankName ||
      !withdrawData.accountNumber ||
      !withdrawData.accountName
    ) {
      Alert.alert("Error", "Please fill in all bank details");
      return;
    }

    if (withdrawData.accountNumber.length < 10) {
      Alert.alert("Error", "Account number must be at least 10 digits");
      return;
    }

    setLoading(true);

    try {
      await apiService.requestWithdrawal({
        amount,
        bank_name: withdrawData.bankName,
        account_number: withdrawData.accountNumber,
        account_name: withdrawData.accountName,
      });

      setShowWithdraw(false);
      setWithdrawData({
        amount: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
      });

      Alert.alert(
        "Withdrawal Requested",
        "Your withdrawal request has been submitted. It will be processed within 24 hours.",
        [{ text: "OK" }]
      );

      // Refresh wallet data
      fetchWallet();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to request withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawData = (field: string, value: string) => {
    setWithdrawData((prev) => ({ ...prev, [field]: value }));
  };

  const getTransactionIcon = (type: ApiTransaction["type"]) => {
    switch (type) {
      case "wallet_topup":
        return <ArrowDownLeft size={20} color={Colors.success} />;
      case "withdrawal":
        return <ArrowUpRight size={20} color={Colors.warning} />;
      case "purchase":
        return <CreditCard size={20} color={Colors.error} />;
      case "sale":
        return <CreditCard size={20} color={Colors.success} />;
      default:
        return <CreditCard size={20} color={Colors.primary} />;
    }
  };

  const balance = user?.wallet_balance || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <Text style={styles.headerSubtitle}>
          Manage your Trash4Cash balance
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.balanceBadge}>
              <Text style={styles.balanceBadgeText}>NGN</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>

          <View style={styles.balanceActions}>
            <Button
              title="Top Up Wallet"
              onPress={() => setShowTopUp(true)}
              variant="primary"
              size="medium"
              style={styles.topUpButton}
            />
            <Button
              title="Withdraw"
              onPress={() => setShowWithdraw(true)}
              variant="outline"
              size="medium"
              style={styles.withdrawButton}
            />
          </View>
        </View>

        {/* Top Up Modal */}
        {showTopUp && (
          <View style={styles.topUpCard}>
            <View style={styles.topUpHeader}>
              <Text style={styles.topUpTitle}>Top Up Your Wallet</Text>
              <Text style={styles.topUpSubtitle}>Powered by Paystack</Text>
            </View>

            <Input
              label="Amount (₦)"
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              hint="Minimum: ₦1,000 | Maximum: ₦500,000"
            />

            <View style={styles.quickAmounts}>
              {[5000, 10000, 25000, 50000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => setTopUpAmount(amount.toString())}
                >
                  <Text style={styles.quickAmountText}>
                    ₦{amount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.topUpActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowTopUp(false);
                  setTopUpAmount("");
                }}
                variant="outline"
                size="medium"
                style={styles.cancelButton}
              />
              <Button
                title="Pay with Paystack"
                onPress={handleTopUp}
                loading={loading}
                variant="primary"
                size="medium"
                style={styles.payButton}
              />
            </View>
          </View>
        )}

        {/* Withdraw Modal */}
        {showWithdraw && (
          <View style={styles.withdrawCard}>
            <View style={styles.withdrawHeader}>
              <Text style={styles.withdrawTitle}>Withdraw Funds</Text>
              <Text style={styles.withdrawSubtitle}>
                Available Balance: {formatAmount(balance)}
              </Text>
            </View>

            <Input
              label="Amount (₦)"
              value={withdrawData.amount}
              onChangeText={(value) => updateWithdrawData("amount", value)}
              placeholder="Enter amount"
              keyboardType="numeric"
              hint={`Minimum: ₦1,000 | Maximum: ${formatAmount(balance)}`}
            />

            <Input
              label="Bank Name"
              value={withdrawData.bankName}
              onChangeText={(value) => updateWithdrawData("bankName", value)}
              placeholder="e.g. First Bank of Nigeria"
            />

            <Input
              label="Account Number"
              value={withdrawData.accountNumber}
              onChangeText={(value) =>
                updateWithdrawData("accountNumber", value)
              }
              placeholder="Enter 10-digit account number"
              keyboardType="numeric"
              maxLength={10}
            />

            <Input
              label="Account Name"
              value={withdrawData.accountName}
              onChangeText={(value) => updateWithdrawData("accountName", value)}
              placeholder="Enter account holder name"
            />

            <View style={styles.withdrawInfo}>
              <Text style={styles.withdrawInfoText}>
                • Withdrawals are processed within 24 hours
              </Text>
              <Text style={styles.withdrawInfoText}>
                • Minimum withdrawal amount is ₦1,000
              </Text>
              <Text style={styles.withdrawInfoText}>
                • Ensure account details are correct
              </Text>
            </View>

            <View style={styles.withdrawActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowWithdraw(false);
                  setWithdrawData({
                    amount: "",
                    bankName: "",
                    accountNumber: "",
                    accountName: "",
                  });
                }}
                variant="outline"
                size="medium"
                style={styles.cancelButton}
              />
              <Button
                title="Request Withdrawal"
                onPress={handleWithdraw}
                loading={loading}
                variant="primary"
                size="medium"
                style={styles.withdrawSubmitButton}
              />
            </View>
          </View>
        )}

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How it works</Text>
              <Text style={styles.infoText}>
                Top up your wallet to make secure payments. Sellers receive
                manual payments from our admin team.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🔒</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Secure Payments</Text>
              <Text style={styles.infoText}>
                All transactions are powered by Paystack, Nigeria's trusted
                payment platform.
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {wallet?.recent_transactions &&
          wallet.recent_transactions.length > 0 ? (
            wallet.recent_transactions.slice(0, 5).map((transaction) => (
              <View key={transaction._id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIcon}>
                    {getTransactionIcon(transaction.type)}
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text
                      style={styles.transactionDescription}
                      numberOfLines={1}
                    >
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.created_at)}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === "wallet_topup" ||
                          transaction.type === "sale"
                            ? Colors.success
                            : Colors.dark,
                      },
                    ]}
                  >
                    {transaction.type === "wallet_topup" ||
                    transaction.type === "sale"
                      ? "+"
                      : "-"}
                    {formatAmount(transaction.amount)}
                  </Text>
                  <Text style={styles.transactionType}>
                    {transaction.type
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyTransactionsText}>
                No transactions yet
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 50,
  },
  headerTitle: {
    ...Typography.h2,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
  },
  balanceCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceLabel: {
    ...Typography.body,
    color: Colors.gray600,
  },
  balanceBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontFamily: "Inter-SemiBold",
  },
  balanceAmount: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  topUpButton: {
    flex: 1,
    marginRight: 12,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
  },
  historyButtonText: {
    ...Typography.button,
    color: Colors.primary,
    marginLeft: 6,
  },
  topUpCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  topUpHeader: {
    marginBottom: 20,
  },
  topUpTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },
  topUpSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  quickAmountText: {
    ...Typography.caption,
    color: Colors.gray700,
  },
  topUpActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  payButton: {
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Typography.bodySemiBold,
    marginBottom: 4,
  },
  infoText: {
    ...Typography.body,
    color: Colors.gray600,
    fontSize: 14,
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionsTitle: {
    ...Typography.h3,
  },
  viewAllText: {
    ...Typography.body,
    color: Colors.primary,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    ...Typography.bodySemiBold,
    marginBottom: 2,
  },
  transactionDate: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    ...Typography.bodySemiBold,
    marginBottom: 2,
  },
  transactionType: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTransactionsText: {
    ...Typography.body,
    color: Colors.gray500,
  },
  bottomSpacing: {
    height: 20,
  },
  withdrawButton: {
    flex: 1,
    marginLeft: 12,
  },
  withdrawCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  withdrawHeader: {
    marginBottom: 20,
  },
  withdrawTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },
  withdrawSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
  },
  withdrawInfo: {
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  withdrawInfoText: {
    ...Typography.caption,
    color: Colors.gray600,
    marginBottom: 4,
  },
  withdrawActions: {
    flexDirection: "row",
    gap: 12,
  },
  withdrawSubmitButton: {
    flex: 1,
  },
});
