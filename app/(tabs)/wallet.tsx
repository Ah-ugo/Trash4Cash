"use client";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../styles/colors";
import { Spacing } from "../../styles/spacing";
import { Typography } from "../../styles/typography";

interface Transaction {
  _id: string;
  type: "purchase" | "sale" | "wallet_topup" | "withdrawal";
  amount: number;
  description: string;
  created_at: string;
}

interface WalletData {
  balance: number;
  recent_transactions: Transaction[];
}

export default function WalletScreen() {
  const { user, token, updateUser } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
  });
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchWalletData();

    // Set up event listener for deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (event: { url: string }) => {
    // Handle deep link from payment callback
    if (event.url.includes("payment-result")) {
      const url = new URL(event.url);
      const status = url.searchParams.get("status");
      const amount = url.searchParams.get("amount");

      if (status === "success" && amount) {
        Alert.alert(
          "Payment Successful",
          `Your wallet has been topped up with ₦${amount}`
        );
        fetchWalletData();
      } else if (status === "failed") {
        Alert.alert(
          "Payment Failed",
          "Your payment was not successful. Please try again."
        );
      }
    }
  };

  const fetchWalletData = async () => {
    try {
      const response = await fetch("https://trash4app-be.onrender.com/wallet", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setWalletData(data);
      updateUser({ wallet_balance: data.balance });
    } catch (error) {
      Alert.alert("Error", "Failed to fetch wallet data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const initiateTopup = async () => {
    if (!topupAmount || Number.parseFloat(topupAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setProcessingPayment(true);

    try {
      const response = await fetch(
        "https://trash4app-be.onrender.com/wallet/initiate-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Number.parseFloat(topupAmount),
            email: user?.email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Open Paystack payment URL
        const supported = await Linking.canOpenURL(data.authorization_url);
        if (supported) {
          await Linking.openURL(data.authorization_url);
          setTopupAmount("");
          setShowTopup(false);
        } else {
          Alert.alert("Error", "Cannot open payment page");
        }
      } else {
        Alert.alert("Error", data.detail || "Payment initiation failed");
      }
    } catch (error) {
      Alert.alert("Error", "Payment initiation failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const requestWithdrawal = async () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (
      !bankDetails.bank_name ||
      !bankDetails.account_number ||
      !bankDetails.account_name
    ) {
      Alert.alert("Error", "Please fill in all bank details");
      return;
    }

    if (Number.parseFloat(withdrawAmount) > (walletData?.balance || 0)) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    try {
      const response = await fetch(
        "https://trash4app-be.onrender.com/wallet/withdraw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Number.parseFloat(withdrawAmount),
            ...bankDetails,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          "Withdrawal request submitted! Admin will review and process it."
        );
        setWithdrawAmount("");
        setBankDetails({
          bank_name: "",
          account_number: "",
          account_name: "",
        });
        setShowWithdraw(false);
        fetchWalletData();
      } else {
        Alert.alert("Error", data.detail || "Withdrawal request failed");
      }
    } catch (error) {
      Alert.alert("Error", "Withdrawal request failed");
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return "🛒";
      case "sale":
        return "💰";
      case "wallet_topup":
        return "⬆️";
      case "withdrawal":
        return "⬇️";
      default:
        return "💳";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return Colors.error;
      case "sale":
        return Colors.green500;
      case "wallet_topup":
        return Colors.blue500;
      case "withdrawal":
        return Colors.secondary;
      default:
        return Colors.gray500;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceAmount}>
            ₦{walletData?.balance.toLocaleString() || "0"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => setShowTopup(true)}
            style={[styles.actionButton, styles.topupButton]}
          >
            <Text style={styles.actionButtonText}>⬆️ Top Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowWithdraw(true)}
            style={[styles.actionButton, styles.withdrawButton]}
          >
            <Text style={styles.actionButtonText}>⬇️ Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Top Up Modal */}
        {showTopup && (
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Top Up Wallet</Text>
            <TextInput
              value={topupAmount}
              onChangeText={setTopupAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowTopup(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={initiateTopup}
                disabled={processingPayment}
                style={[styles.modalButton, styles.confirmButton]}
              >
                {processingPayment ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Pay with Paystack
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Withdraw Modal */}
        {showWithdraw && (
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Request Withdrawal</Text>
            <TextInput
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              value={bankDetails.bank_name}
              onChangeText={(text) =>
                setBankDetails((prev) => ({ ...prev, bank_name: text }))
              }
              placeholder="Bank Name"
              style={styles.modalInput}
            />
            <TextInput
              value={bankDetails.account_number}
              onChangeText={(text) =>
                setBankDetails((prev) => ({ ...prev, account_number: text }))
              }
              placeholder="Account Number"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              value={bankDetails.account_name}
              onChangeText={(text) =>
                setBankDetails((prev) => ({ ...prev, account_name: text }))
              }
              placeholder="Account Name"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowWithdraw(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={requestWithdrawal}
                style={[styles.modalButton, styles.withdrawConfirmButton]}
              >
                <Text style={styles.confirmButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>

          {walletData?.recent_transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyTransactionsText}>
                No transactions yet
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {walletData?.recent_transactions.map((transaction, index) => (
                <View
                  key={transaction._id}
                  style={[
                    styles.transactionItem,
                    index !== walletData.recent_transactions.length - 1 &&
                      styles.transactionItemBorder,
                  ]}
                >
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionIcon}>
                      {getTransactionIcon(transaction.type)}
                    </Text>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {transaction.type === "purchase" ||
                    transaction.type === "withdrawal"
                      ? "-"
                      : "+"}
                    ₦{transaction.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.light,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.gray600,
    marginTop: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  balanceLabel: {
    ...Typography.body,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    ...Typography.h1,
    color: Colors.white,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  topupButton: {
    backgroundColor: Colors.blue500,
  },
  withdrawButton: {
    backgroundColor: Colors.secondary,
  },
  actionButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  modal: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.gray300,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  withdrawConfirmButton: {
    backgroundColor: Colors.secondary,
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  confirmButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  transactionsSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  transactionsTitle: {
    ...Typography.h4,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  emptyTransactions: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: "center",
  },
  emptyTransactionsText: {
    ...Typography.bodySmall,
    color: Colors.gray500,
    textAlign: "center",
  },
  transactionsList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  transactionItem: {
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    ...Typography.body,
    color: Colors.accent,
  },
  transactionDate: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  transactionAmount: {
    ...Typography.button,
  },
});
