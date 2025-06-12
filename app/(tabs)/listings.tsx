import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { Typography } from "@/styles/typography";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
  whatsapp: string;
  created_at: string;
}

const categories = [
  { name: "All", icon: "🗂️" },
  { name: "Plastic", icon: "🥤" },
  { name: "Metal", icon: "🔩" },
  { name: "Paper", icon: "📄" },
  { name: "Glass", icon: "🍾" },
  { name: "Electronics", icon: "📱" },
  { name: "Other", icon: "♻️" },
];

export default function ListingsScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, selectedCategory, searchQuery]);

  const fetchListings = async () => {
    try {
      const response = await fetch(
        "https://trash4app-be.onrender.com/listings"
      );
      const data = await response.json();
      setListings(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterListings = () => {
    let filtered = listings;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (listing) => listing.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.location.toLowerCase().includes(query)
      );
    }

    setFilteredListings(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const openWhatsApp = async (whatsapp: string, title: string) => {
    const message = `Hi! I'm interested in your listing: ${title}`;
    const url = `whatsapp://send?phone=${whatsapp}&text=${encodeURIComponent(message)}`;

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Browse Listings</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search listings..."
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.name}
              onPress={() => setSelectedCategory(category.name)}
              style={[
                styles.categoryButton,
                selectedCategory === category.name
                  ? styles.categoryButtonActive
                  : styles.categoryButtonInactive,
              ]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name
                    ? styles.categoryTextActive
                    : styles.categoryTextInactive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listings */}
      <ScrollView
        style={styles.listingsContainer}
        contentContainerStyle={styles.listingsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading listings...</Text>
          </View>
        ) : filteredListings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? "No listings match your search criteria. Try different keywords."
                : "No listings found in this category. Try selecting a different category."}
            </Text>
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {filteredListings.map((listing) => (
              <TouchableOpacity
                key={listing._id}
                onPress={() => router.push(`/listing/${listing._id}`)}
                style={styles.listingCard}
              >
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    source={{ uri: listing.images[0] }}
                    style={styles.listingImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.listingImagePlaceholder}>
                    <Text style={styles.listingImagePlaceholderText}>📷</Text>
                  </View>
                )}
                <View style={styles.listingContent}>
                  <View style={styles.listingHeader}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <Text style={styles.listingPrice}>
                      ₦{listing.price.toLocaleString()}
                    </Text>
                  </View>

                  <Text style={styles.listingDescription} numberOfLines={2}>
                    {listing.description}
                  </Text>

                  <View style={styles.listingFooter}>
                    <View style={styles.listingInfo}>
                      <Text style={styles.listingLocation}>
                        📍 {listing.location}
                      </Text>
                      <Text style={styles.listingWeight}>
                        ⚖️ {listing.weight}kg
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        openWhatsApp(listing.whatsapp, listing.title);
                      }}
                      style={styles.chatButton}
                    >
                      <Text style={styles.chatButtonText}>💬</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    ...Typography.h2,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.accent,
  },
  categoriesSection: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonInactive: {
    backgroundColor: Colors.gray100,
  },
  categoryIcon: {
    marginRight: Spacing.xs,
    fontSize: 16,
  },
  categoryText: {
    ...Typography.bodySmall,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: Colors.white,
  },
  categoryTextInactive: {
    color: Colors.gray700,
  },
  listingsContainer: {
    flex: 1,
  },
  listingsContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.gray500,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.gray500,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  listingsGrid: {
    gap: Spacing.md,
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  listingImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  listingImagePlaceholder: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: Colors.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  listingImagePlaceholderText: {
    fontSize: 32,
    color: Colors.gray400,
  },
  listingContent: {
    padding: Spacing.md,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  listingTitle: {
    ...Typography.h4,
    color: Colors.accent,
    flex: 1,
    marginRight: Spacing.sm,
  },
  listingPrice: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: "bold",
  },
  listingDescription: {
    ...Typography.bodySmall,
    color: Colors.gray600,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  listingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingInfo: {
    flex: 1,
  },
  listingLocation: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  listingWeight: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  chatButton: {
    backgroundColor: Colors.green500,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
  chatButtonText: {
    fontSize: 16,
  },
});
