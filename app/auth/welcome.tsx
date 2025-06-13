"use client";
import { useRouter } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/common/Button";
import { Colors, Typography } from "../../constants/Colors";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>♻️</Text>
          </View>
          <Text style={styles.appName}>Trash4Cash</Text>
          <Text style={styles.tagline}>Turn your trash into cash</Text>
        </View>

        <View style={styles.illustrationSection}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationIcon}>🗂️💰</Text>
          </View>
          <Text style={styles.illustrationText}>
            Connect with buyers and sellers of recyclable materials in your area
          </Text>
        </View>

        <SafeAreaView style={styles.buttonSection}>
          <Button
            title="Get Started"
            onPress={() => router.push("/auth/register")}
            style={styles.primaryButton}
          />

          <Button
            title="I already have an account"
            onPress={() => router.push("/auth/login")}
            variant="outline"
            style={styles.secondaryButton}
          />
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    ...Typography.h1,
    marginBottom: 8,
  },
  tagline: {
    ...Typography.body,
    color: Colors.gray600,
    textAlign: "center",
  },
  illustrationSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  illustration: {
    width: 120,
    height: 120,
    backgroundColor: Colors.gray100,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  illustrationIcon: {
    fontSize: 48,
  },
  illustrationText: {
    ...Typography.body,
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonSection: {
    gap: 16,
    marginBottom: 20,
  },
  primaryButton: {
    marginBottom: 0,
  },
  secondaryButton: {
    marginBottom: 0,
  },
});
