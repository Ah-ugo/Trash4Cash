import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { Typography } from "@/styles/typography";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  weight: number;
  location: string;
  images: string[];
  seller_name: string;
  seller_phone: string;
  whatsapp: string;
  created_at: string;
  seller_id: string;
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(
        `https://trash4app-be.onrender.com/listings/${id}`
      );
      const data = await response.json();

      if (response.ok) {
        setListing(data);
      } else {
        Alert.alert("Error", "Listing not found");
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch listing details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const purchaseListing = async () => {
    if (!listing || !user) return;

    if (listing.seller_id === user._id) {
      Alert.alert("Error", "You cannot purchase your own listing");
      return;
    }

    if (user.wallet_balance < listing.price) {
      Alert.alert(
        "Insufficient Balance",
        `You need ₦${listing.price.toLocaleString()} but only have ₦${user.wallet_balance.toLocaleString()}. Please top up your wallet.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Top Up Wallet",
            onPress: () => router.push("/(tabs)/wallet"),
          },
        ]
      );
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Are you sure you want to purchase "${listing.title}" for ₦${listing.price.toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Purchase", onPress: confirmPurchase },
      ]
    );
  };

  const confirmPurchase = async () => {
    if (!listing) return;

    setPurchasing(true);
    try {
      const response = await fetch(
        `https://trash4app-be.onrender.com/listings/${listing._id}/purchase`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Purchase completed successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", data.detail || "Purchase failed");
      }
    } catch (error) {
      Alert.alert("Error", "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const openWhatsApp = async () => {
    if (!listing) return;

    const message = `Hi! I'm interested in your listing: ${listing.title}`;
    const url = `whatsapp://send?phone=${listing.whatsapp}&text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "WhatsApp not installed",
          "Please install WhatsApp to contact the seller"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open WhatsApp");
    }
  };

  const callSeller = async () => {
    if (!listing) return;

    const url = `tel:${listing.seller_phone}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot make phone calls on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to make call");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading listing...</Text>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Listing not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Images */}
        <View style={styles.imageSection}>
          {listing.images && listing.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x /
                      event.nativeEvent.layoutMeasurement.width
                  );
                  setCurrentImageIndex(index);
                }}
              >
                {listing.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.listingImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {listing.images.length > 1 && (
                <View style={styles.imageIndicators}>
                  {listing.images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.imageIndicator,
                        currentImageIndex === index
                          ? styles.imageIndicatorActive
                          : styles.imageIndicatorInactive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>₦{listing.price.toLocaleString()}</Text>
          </View>

          {/* Category and Weight */}
          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{listing.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Weight</Text>
              <Text style={styles.metaValue}>{listing.weight}kg</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.location}>📍 {listing.location}</Text>
          </View>

          {/* Seller Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <Text style={styles.sellerName}>{listing.seller_name}</Text>
            <Text style={styles.listingDate}>
              Listed on {new Date(listing.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.contactButtons}>
          <TouchableOpacity
            onPress={openWhatsApp}
            style={styles.whatsappButton}
          >
            <Text style={styles.whatsappButtonText}>💬 WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={callSeller} style={styles.callButton}>
            <Text style={styles.callButtonText}>📞 Call</Text>
          </TouchableOpacity>
        </View>

        {listing.seller_id !== user?._id && (
          <TouchableOpacity
            onPress={purchaseListing}
            disabled={purchasing}
            style={[
              styles.purchaseButton,
              purchasing && styles.purchaseButtonDisabled,
            ]}
          >
            {purchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.purchaseButtonText}>
                Purchase for ₦{listing.price.toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.gray600,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    ...Typography.h4,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  backButton: {
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
  },
  imageSection: {
    position: "relative",
  },
  listingImage: {
    width: 400, // Approximate screen width
    height: 300,
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: Colors.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 48,
    color: Colors.gray400,
  },
  imageIndicators: {
    position: "absolute",
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  imageIndicatorActive: {
    backgroundColor: Colors.white,
  },
  imageIndicatorInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  content: {
    padding: Spacing.md,
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  price: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: "bold",
  },
  metaSection: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    ...Typography.caption,
    color: Colors.gray600,
    marginBottom: Spacing.xs,
  },
  metaValue: {
    ...Typography.body,
    color: Colors.accent,
    fontWeight: "600",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.gray700,
    lineHeight: 24,
  },
  location: {
    ...Typography.body,
    color: Colors.gray700,
  },
  sellerName: {
    ...Typography.body,
    color: Colors.accent,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  listingDate: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  bottomActions: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  contactButtons: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: Colors.green500,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  whatsappButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  callButton: {
    flex: 1,
    backgroundColor: Colors.blue500,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  callButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  purchaseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  purchaseButtonDisabled: {
    backgroundColor: Colors.gray400,
  },
  purchaseButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
