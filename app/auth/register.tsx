import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { Typography } from "@/styles/typography";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    role: "buyer" as "buyer" | "seller",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.full_name ||
      !formData.phone
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>♻️</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Trash4Cash and start earning from recyclables
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput
                value={formData.full_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, full_name: text }))
                }
                placeholder="Enter your full name"
                style={styles.textInput}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email Address *</Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone Number *</Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                placeholder="e.g., +2348012345678"
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Password *</Text>
              <TextInput
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                placeholder="Enter your password"
                secureTextEntry
                style={styles.textInput}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Confirm Password *</Text>
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: text }))
                }
                placeholder="Confirm your password"
                secureTextEntry
                style={styles.textInput}
              />
            </View>

            {/* Role Selection */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>I want to *</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, role: "buyer" }))
                  }
                  style={[
                    styles.roleButton,
                    formData.role === "buyer"
                      ? styles.roleButtonActive
                      : styles.roleButtonInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === "buyer"
                        ? styles.roleButtonTextActive
                        : styles.roleButtonTextInactive,
                    ]}
                  >
                    🛒 Buy Trash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, role: "seller" }))
                  }
                  style={[
                    styles.roleButton,
                    formData.role === "seller"
                      ? styles.roleButtonActive
                      : styles.roleButtonInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === "seller"
                        ? styles.roleButtonTextActive
                        : styles.roleButtonTextInactive,
                    ]}
                  >
                    💰 Sell Trash
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={[
              styles.registerButton,
              loading && styles.registerButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    ...Typography.h1,
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.gray600,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Typography.caption,
    color: Colors.gray600,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
  },
  roleButtons: {
    flexDirection: "row",
  },
  roleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  roleButtonInactive: {
    backgroundColor: Colors.gray200,
    marginLeft: Spacing.sm,
  },
  roleButtonText: {
    ...Typography.bodySmall,
  },
  roleButtonTextActive: {
    color: Colors.white,
  },
  roleButtonTextInactive: {
    color: Colors.gray700,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.gray400,
  },
  registerButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.gray600,
  },
  footerLink: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: "bold",
  },
});
