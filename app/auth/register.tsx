"use client";

import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
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
import { NIGERIAN_STATES } from "../../constants/ScrapCategories";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    password: "",
    confirmPassword: "",
    role: "buyer" as "buyer" | "seller",
  });
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSignup = async () => {
    const {
      full_name,
      email,
      phone,
      whatsapp,
      city,
      password,
      confirmPassword,
    } = formData;

    if (
      !full_name ||
      !email ||
      !phone ||
      !whatsapp ||
      !city ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
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

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectLocation = (state: string) => {
    updateFormData("city", state);
    setShowLocationPicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Join Trash4Cash</Text>
          <Text style={styles.subtitle}>
            Start turning your trash into cash today
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={formData.full_name}
            onChangeText={(value) => updateFormData("full_name", value)}
            placeholder="Enter your full name"
          />

          <Input
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(value) => updateFormData("phone", value)}
            placeholder="+234 800 123 4567"
            keyboardType="phone-pad"
          />

          <Input
            label="WhatsApp Number"
            value={formData.whatsapp}
            onChangeText={(value) => updateFormData("whatsapp", value)}
            placeholder="+234 800 123 4567"
            keyboardType="phone-pad"
            hint="This will be used for buyer-seller communication"
          />

          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Location (State)</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowLocationPicker(!showLocationPicker)}
            >
              <Text
                style={[
                  styles.locationButtonText,
                  !formData.city && styles.placeholder,
                ]}
              >
                {formData.city || "Select your state"}
              </Text>
            </TouchableOpacity>

            {showLocationPicker && (
              <ScrollView style={styles.locationPicker} nestedScrollEnabled>
                {NIGERIAN_STATES.map((state) => (
                  <TouchableOpacity
                    key={state}
                    style={styles.locationOption}
                    onPress={() => selectLocation(state)}
                  >
                    <Text style={styles.locationOptionText}>{state}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData("password", value)}
            placeholder="Create a password"
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData("confirmPassword", value)}
            placeholder="Confirm your password"
            secureTextEntry
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            style={styles.signupButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    ...Typography.h3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    ...Typography.h2,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray600,
  },
  form: {
    flex: 1,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationLabel: {
    ...Typography.bodySemiBold,
    color: Colors.dark,
    marginBottom: 8,
  },
  locationButton: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  locationButtonText: {
    ...Typography.body,
    color: Colors.dark,
  },
  placeholder: {
    color: Colors.gray400,
  },
  locationPicker: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    backgroundColor: Colors.white,
    marginTop: 8,
  },
  locationOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  locationOptionText: {
    ...Typography.body,
    color: Colors.dark,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  footerText: {
    ...Typography.body,
    color: Colors.gray600,
  },
  footerLink: {
    ...Typography.bodySemiBold,
    color: Colors.primary,
  },
});
