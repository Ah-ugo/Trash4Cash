import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { Typography } from "@/styles/typography";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthWelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>♻️</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Trash4Cash</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Turn your trash into cash! Buy and sell recyclable materials with
          ease.
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Earn money from recyclables</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🌍</Text>
            <Text style={styles.featureText}>Help save the environment</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureText}>Easy mobile marketplace</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() => router.push("/auth/register")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>I Have an Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    width: 128,
    height: 128,
    backgroundColor: Colors.white,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  logoIcon: {
    fontSize: 48,
  },
  title: {
    ...Typography.h1,
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.xxl,
    opacity: 0.9,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: Spacing.xxl,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  featureText: {
    ...Typography.body,
    color: Colors.white,
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.primary,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
