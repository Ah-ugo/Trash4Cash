import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { Typography } from "@/styles/typography";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, token, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    whatsapp: user?.whatsapp || "",
    city: user?.city || "",
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      const response = await fetch(
        "https://trash4app-be.onrender.com/profile/upload-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        updateUser({ profile_image: data.image_url });
        Alert.alert("Success", "Profile image updated successfully!");
      } else {
        Alert.alert("Error", data.detail || "Failed to upload image");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://trash4app-be.onrender.com/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        setEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", data.detail || "Failed to update profile");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.profileImageContainer}
          >
            {user?.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageIcon}>👤</Text>
              </View>
            )}
            {loading && (
              <View style={styles.profileImageLoading}>
                <ActivityIndicator color="white" />
              </View>
            )}
            <View style={styles.profileImageBadge}>
              <Text style={styles.profileImageBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{user?.full_name}</Text>
          <Text style={styles.profileRole}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Profile Information</Text>
            <TouchableOpacity
              onPress={() => (editing ? updateProfile() : setEditing(true))}
              disabled={loading}
              style={styles.editButton}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.editButtonText}>
                  {editing ? "Save" : "Edit"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formFields}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                value={formData.full_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, full_name: text }))
                }
                editable={editing}
                style={[
                  styles.fieldInput,
                  !editing && styles.fieldInputDisabled,
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                value={user?.email}
                editable={false}
                style={[styles.fieldInput, styles.fieldInputDisabled]}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                editable={editing}
                keyboardType="phone-pad"
                style={[
                  styles.fieldInput,
                  !editing && styles.fieldInputDisabled,
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>WhatsApp</Text>
              <TextInput
                value={formData.whatsapp}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, whatsapp: text }))
                }
                editable={editing}
                keyboardType="phone-pad"
                placeholder="e.g., +2348012345678"
                style={[
                  styles.fieldInput,
                  !editing && styles.fieldInputDisabled,
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                value={formData.city}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, city: text }))
                }
                editable={editing}
                placeholder="e.g., Lagos, Abuja"
                style={[
                  styles.fieldInput,
                  !editing && styles.fieldInputDisabled,
                ]}
              />
            </View>
          </View>

          {editing && (
            <TouchableOpacity
              onPress={() => {
                setEditing(false);
                setFormData({
                  full_name: user?.full_name || "",
                  phone: user?.phone || "",
                  whatsapp: user?.whatsapp || "",
                  city: user?.city || "",
                });
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Wallet Info */}
        <View style={styles.walletContainer}>
          <Text style={styles.walletTitle}>Wallet Balance</Text>
          <Text style={styles.walletBalance}>
            ₦{user?.wallet_balance?.toLocaleString() || "0"}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>My Listings</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>Support</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>ℹ️</Text>
              <Text style={styles.actionText}>About</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  profileImagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.gray300,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImageIcon: {
    fontSize: 32,
  },
  profileImageLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.xs,
  },
  profileImageBadgeText: {
    color: Colors.white,
    fontSize: 12,
  },
  profileName: {
    ...Typography.h3,
    color: Colors.accent,
    marginTop: Spacing.sm,
  },
  profileRole: {
    ...Typography.bodySmall,
    color: Colors.gray600,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  formTitle: {
    ...Typography.h4,
    color: Colors.accent,
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  editButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
  },
  formFields: {
    gap: Spacing.md,
  },
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Typography.caption,
    color: Colors.gray600,
    marginBottom: Spacing.xs,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
  },
  fieldInputDisabled: {
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
    color: Colors.gray500,
  },
  cancelButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.gray300,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  walletContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  walletTitle: {
    ...Typography.h4,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  walletBalance: {
    ...Typography.h2,
    color: Colors.primary,
  },
  actionsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  actionText: {
    ...Typography.body,
    color: Colors.accent,
  },
  actionArrow: {
    ...Typography.body,
    color: Colors.gray400,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoutButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
