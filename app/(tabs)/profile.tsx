"use client";

import {
  Camera,
  Edit3,
  HelpCircle,
  Info,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
import type { ApiListing } from "../../types/api";

interface UserStats {
  wallet_balance: number;
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  total_sales_amount: number;
}

export default function ProfileScreen() {
  const { user, logout, updateUser, refreshUser } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    whatsapp: user?.whatsapp || "",
    city: user?.city || "",
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Fetch user's listings to calculate stats
      const myListings: ApiListing[] = await apiService.getMyListings();

      // Calculate stats from listings
      const totalListings = myListings.length;
      const activeListings = myListings.filter(
        (listing) => listing.status === "active"
      ).length;
      const soldListings = myListings.filter(
        (listing) => listing.status === "sold"
      ).length;
      const totalSalesAmount = myListings
        .filter((listing) => listing.status === "sold")
        .reduce((sum, listing) => sum + listing.price, 0);

      setStats({
        wallet_balance: user?.wallet_balance || 0,
        total_listings: totalListings,
        active_listings: activeListings,
        sold_listings: soldListings,
        total_sales_amount: totalSalesAmount,
      });
    } catch (error: any) {
      console.error("Error fetching user stats:", error);
      // Use fallback stats if API fails
      setStats({
        wallet_balance: user?.wallet_balance || 0,
        total_listings: 0,
        active_listings: 0,
        sold_listings: 0,
        total_sales_amount: 0,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([refreshUser(), fetchUserStats()]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    try {
      await apiService.updateProfile(editData);
      updateUser(editData);
      setShowEditProfile(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  const updateEditData = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>
          Manage your account and preferences
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.profile_image ? (
                <Image
                  source={{ uri: user.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={32} color={Colors.gray400} />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.full_name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>
                  {user?.role?.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditProfile(true)}
            >
              <Edit3 size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.profileDetailItem}>
              <Phone size={16} color={Colors.gray500} />
              <Text style={styles.profileDetailText}>
                {user?.phone || "Not provided"}
              </Text>
            </View>
            <View style={styles.profileDetailItem}>
              <MessageCircle size={16} color={Colors.gray500} />
              <Text style={styles.profileDetailText}>
                {user?.whatsapp || "Not provided"}
              </Text>
            </View>
            <View style={styles.profileDetailItem}>
              <MapPin size={16} color={Colors.gray500} />
              <Text style={styles.profileDetailText}>
                {user?.city || "Not provided"}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {formatAmount(stats?.wallet_balance || 0)}
              </Text>
              <Text style={styles.statLabel}>Wallet Balance</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.sold_listings || 0}</Text>
              <Text style={styles.statLabel}>Items Sold</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {stats?.active_listings || 0}
              </Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {stats?.total_listings || 0}
              </Text>
              <Text style={styles.statLabel}>Total Listings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {formatAmount(stats?.total_sales_amount || 0)}
              </Text>
              <Text style={styles.statLabel}>Total Sales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {stats?.total_listings && stats?.sold_listings
                  ? Math.round(
                      (stats.sold_listings / stats.total_listings) * 100
                    )
                  : 0}
                %
              </Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.modalSubtitle}>
                Update your personal information
              </Text>
            </View>

            <Input
              label="Full Name"
              value={editData.full_name}
              onChangeText={(value) => updateEditData("full_name", value)}
              placeholder="Enter your full name"
            />

            <Input
              label="Phone Number"
              value={editData.phone}
              onChangeText={(value) => updateEditData("phone", value)}
              placeholder="+234 800 123 4567"
              keyboardType="phone-pad"
            />

            <Input
              label="WhatsApp Number"
              value={editData.whatsapp}
              onChangeText={(value) => updateEditData("whatsapp", value)}
              placeholder="+234 800 123 4567"
              keyboardType="phone-pad"
            />

            <Input
              label="City"
              value={editData.city}
              onChangeText={(value) => updateEditData("city", value)}
              placeholder="Enter your city"
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowEditProfile(false)}
                variant="outline"
                size="medium"
                style={styles.modalCancelButton}
              />
              <Button
                title="Save Changes"
                onPress={handleUpdateProfile}
                variant="primary"
                size="medium"
                style={styles.modalSaveButton}
              />
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={Colors.gray600} />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowSupport(true)}
          >
            <View style={styles.menuItemLeft}>
              <HelpCircle size={20} color={Colors.gray600} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAbout(true)}
          >
            <View style={styles.menuItemLeft}>
              <Info size={20} color={Colors.gray600} />
              <Text style={styles.menuItemText}>About</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <LogOut size={20} color={Colors.error} />
              <Text style={[styles.menuItemText, styles.logoutText]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Modal */}
        {showSupport && (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <Text style={styles.modalSubtitle}>
                Get help with your account
              </Text>
            </View>

            <View style={styles.supportContent}>
              <Text style={styles.supportText}>
                Need help? Contact our support team at support@trash4cash.ng or
                call +234 800 TRASH4CASH
              </Text>
              <Text style={styles.supportText}>
                We're available Monday to Friday, 9AM to 6PM WAT to assist you
                with any questions or issues.
              </Text>
            </View>

            <Button
              title="Close"
              onPress={() => setShowSupport(false)}
              variant="primary"
              size="medium"
            />
          </View>
        )}

        {/* About Modal */}
        {showAbout && (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About Trash4Cash</Text>
              <Text style={styles.modalSubtitle}>Version 1.0.0</Text>
            </View>

            <View style={styles.aboutContent}>
              <Text style={styles.aboutText}>
                Trash4Cash is Nigeria's leading platform for buying and selling
                recyclable materials. We connect buyers and sellers to create a
                sustainable circular economy.
              </Text>
              <Text style={styles.aboutText}>
                Our mission is to reduce waste and create economic opportunities
                by making recycling accessible to everyone.
              </Text>
            </View>

            <Button
              title="Close"
              onPress={() => setShowAbout(false)}
              variant="primary"
              size="medium"
            />
          </View>
        )}

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
  profileCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.body,
    color: Colors.gray600,
    marginBottom: 8,
  },
  profileBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  profileBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontFamily: "Inter-SemiBold",
  },
  editButton: {
    padding: 8,
  },
  profileDetails: {
    gap: 12,
  },
  profileDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileDetailText: {
    ...Typography.body,
    color: Colors.gray600,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.gray600,
    textAlign: "center",
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    ...Typography.bodySemiBold,
    color: Colors.dark,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    color: Colors.error,
  },
  modalCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalSaveButton: {
    flex: 1,
  },
  supportContent: {
    marginBottom: 20,
  },
  supportText: {
    ...Typography.body,
    color: Colors.gray600,
    marginBottom: 12,
    lineHeight: 20,
  },
  aboutContent: {
    marginBottom: 20,
  },
  aboutText: {
    ...Typography.body,
    color: Colors.gray600,
    marginBottom: 12,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});
