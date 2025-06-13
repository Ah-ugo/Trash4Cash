import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/common/Button";
import { Colors, Typography } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";

const { width: screenWidth } = Dimensions.get("window");

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
      const data = await apiService.getListing(id as string);
      setListing(data);
    } catch (error) {
      Alert.alert("Error", "Listing not found");
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
      await apiService.purchaseListing(listing._id);
      Alert.alert("Success", "Purchase completed successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Purchase failed");
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
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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
                    event.nativeEvent.contentOffset.x / screenWidth
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
              <Feather name="package" size={16} color={Colors.gray600} />
              <Text style={styles.imagePlaceholderText}>
                No image available
              </Text>
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

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Feather name="tag" size={16} color={Colors.gray600} />
              <Text style={styles.infoText}>{listing.category}</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="package" size={16} color={Colors.gray600} />
              <Text style={styles.infoText}>{listing.weight}kg</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="map-pin" size={16} color={Colors.gray600} />
              <Text style={styles.infoText}>{listing.location}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {/* Seller Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitial}>
                  {listing.seller_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{listing.seller_name}</Text>
                <Text style={styles.listingDate}>
                  Listed on {new Date(listing.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Seller</Text>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                onPress={openWhatsApp}
                style={styles.whatsappButton}
              >
                <Feather name="message-circle" size={20} color={Colors.white} />
                <Text style={styles.whatsappButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={callSeller} style={styles.callButton}>
                <Feather name="phone" size={20} color={Colors.white} />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Purchase Button */}
      {listing.seller_id !== user?._id && (
        <View style={styles.bottomActions}>
          <Button
            title={`Purchase for ₦${listing.price.toLocaleString()}`}
            onPress={purchaseListing}
            loading={purchasing}
            style={styles.purchaseButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.gray600,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  errorText: {
    ...Typography.h3,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerTitle: {
    ...Typography.h3,
  },
  backButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: "relative",
    backgroundColor: Colors.white,
  },
  listingImage: {
    width: screenWidth,
    height: 300,
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: Colors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    ...Typography.body,
    color: Colors.gray500,
    marginTop: 8,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
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
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    ...Typography.h2,
    marginBottom: 8,
  },
  price: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: "bold",
  },
  quickInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: 12,
  },
  description: {
    ...Typography.body,
    color: Colors.gray700,
    lineHeight: 24,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sellerInitial: {
    ...Typography.h4,
    color: Colors.white,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    ...Typography.bodySemiBold,
    marginBottom: 4,
  },
  listingDate: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: Colors.green500,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  whatsappButtonText: {
    ...Typography.bodySemiBold,
    color: Colors.white,
  },
  callButton: {
    flex: 1,
    backgroundColor: Colors.blue500,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  callButtonText: {
    ...Typography.bodySemiBold,
    color: Colors.white,
  },
  bottomActions: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  purchaseButton: {
    marginBottom: 0,
  },
});
