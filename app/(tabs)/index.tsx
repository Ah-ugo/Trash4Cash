import type { ApiListing } from "@/types/api";
import { router } from "expo-router";
// import { MapPin } from "@expo/vector-icons";
import { HorizontalScrapCard } from "@/components/home/HorizontalScrapCard";
import { VerticalScrapCard } from "@/components/home/VerticalScrapCard";
import Feather from "@expo/vector-icons/Feather";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CategoryFilter from "../../components/home/CategoryFilter";
import { Colors, Typography } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import type { ScrapCategory } from "../../types";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! 👋";
  if (hour < 18) return "Good afternoon! 👋";
  return "Good evening! 👋";
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<
    ScrapCategory | undefined
  >();
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    try {
      const params = selectedCategory
        ? { category: selectedCategory, limit: 20 }
        : { limit: 20 };
      const data = await apiService.getListings(params);
      console.log(data, "listings===");
      setListings(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const featuredItems = listings
    .filter((item) => item.status === "active")
    .slice(0, 3);
  const filteredItems = listings.filter((item) => item.status === "active");
  console.log(filteredItems, "filterd ===");

  const convertToScrapItem = (apiListing: ApiListing) => ({
    id: apiListing._id,
    title: apiListing.title,
    description: apiListing.description,
    category: apiListing.category as ScrapCategory,
    price: apiListing.price,
    weight: apiListing.weight,
    location: apiListing.location,
    images: apiListing.images,
    seller: {
      id: apiListing.seller_id,
      name: apiListing.seller_name,
      isVerified: false, // API doesn't have this field yet
      profileImage: "/placeholder.svg?height=40&width=40",
    },
    datePosted: apiListing.created_at,
    isFeatured: false, // API doesn't have this field yet
    status: apiListing.status as "active" | "sold" | "pending",
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.location}>{user?.full_name}</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          {/* <MapPin size={16} color={Colors.gray500} /> */}
          <Feather name="map-pin" size={16} color={Colors.gray500} />
          <Text style={styles.location}>{user?.city || "Nigeria"}</Text>
        </View>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Turn Your Trash Into Cash</Text>
        <Text style={styles.welcomeSubtitle}>
          Discover great deals on recyclable materials or sell your scrap for
          extra income
        </Text>
      </View>

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Featured Items */}
        {featuredItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Items</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.scrollContent}
            >
              {featuredItems.map((item) => (
                <HorizontalScrapCard
                  key={item._id}
                  item={convertToScrapItem(item)}
                  onPress={() => router.push(`/listing/${item._id}`)}
                  // styleObj={styles.featuredCard}
                  // isFeatured={true}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? "Filtered Results" : "Recent Listings"}
          </Text>
          {loading ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>Loading listings...</Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No items found</Text>
              <Text style={styles.emptyStateText}>
                {selectedCategory
                  ? "Try selecting a different category or check back later"
                  : "No listings available. Be the first to post!"}
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <VerticalScrapCard
                key={item._id}
                item={convertToScrapItem(item)}
                onPress={() => router.push(`/listing/${item._id}`)}
                styleObj={styles.recentCard}
                isFeatured={false}
              />
            ))
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 50,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...Typography.h3,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    ...Typography.body,
    color: Colors.gray600,
    marginLeft: 4,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  welcomeTitle: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 5,
  },
  scrollContent: {
    paddingHorizontal: 5,
    flexDirection: "row",
  },
  featuredCard: {
    marginHorizontal: 8,
    width: Math.min(Math.max(250, windowWidth * 0.7), 320),
  },
  recentCard: {
    width: Math.min(Math.max(300, windowWidth * 0.9), 400),
    marginHorizontal: "auto",
    marginBottom: 16,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.gray500,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    ...Typography.h4,
    color: Colors.gray600,
    marginBottom: 8,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 20,
  },
});
