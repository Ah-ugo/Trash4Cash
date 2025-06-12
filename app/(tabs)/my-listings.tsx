"use client";

import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../styles/colors";
import { Spacing } from "../../styles/spacing";
import { Typography } from "../../styles/typography";

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  weight: number;
  location: string;
  images: string[];
  status: "active" | "sold" | "banned" | "deleted";
  created_at: string;
}

export default function MyListingsScreen() {
  const { user, token } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const response = await fetch(
        "https://trash4app-be.onrender.com/my-listings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setListings(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch your listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyListings();
  };

  const deleteListing = async (listingId: string) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(listingId);
            try {
              const response = await fetch(
                `https://trash4app-be.onrender.com/listings/${listingId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                // Update the listings list
                setListings((prevListings) =>
                  prevListings.filter((listing) => listing._id !== listingId)
                );
                Alert.alert("Success", "Listing deleted successfully");
              } else {
                const data = await response.json();
                Alert.alert("Error", data.detail || "Failed to delete listing");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete listing");
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const editListing = (listingId: string) => {
    router.push(`/listing/edit/${listingId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return Colors.green500;
      case "sold":
        return Colors.blue500;
      case "banned":
        return Colors.error;
      case "deleted":
        return Colors.gray500;
      default:
        return Colors.gray500;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "sold":
        return "Sold";
      case "banned":
        return "Banned";
      case "deleted":
        return "Deleted";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Listings</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/create")}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
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
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your listings...</Text>
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>
              Create your first listing to start selling recyclable materials
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/create")}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {listings.map((listing) => (
              <View key={listing._id} style={styles.listingCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/listing/${listing._id}`)}
                  style={styles.listingImageContainer}
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

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(listing.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(listing.status)}
                    </Text>
                  </View>
                </TouchableOpacity>

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
                    <Text style={styles.listingLocation}>
                      📍 {listing.location}
                    </Text>
                    <Text style={styles.listingWeight}>
                      ⚖️ {listing.weight}kg
                    </Text>
                  </View>

                  <Text style={styles.listingDate}>
                    Posted {new Date(listing.created_at).toLocaleDateString()}
                  </Text>

                  {/* Action buttons */}
                  {listing.status === "active" && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => editListing(listing._id)}
                        style={[styles.actionButton, styles.editButton]}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteListing(listing._id)}
                        disabled={deleting === listing._id}
                        style={[styles.actionButton, styles.deleteButton]}
                      >
                        {deleting === listing._id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    ...Typography.h2,
    color: Colors.accent,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  addButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: "600",
  },
  listingsContainer: {
    flex: 1,
  },
  listingsContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
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
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.gray500,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  createButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  listingsGrid: {
    paddingBottom: Spacing.lg,
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
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  listingImageContainer: {
    position: "relative",
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
  statusBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: "600",
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
    lineHeight: 18,
  },
  listingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  listingLocation: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  listingWeight: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  listingDate: {
    ...Typography.caption,
    color: Colors.gray400,
    fontStyle: "italic",
    marginBottom: Spacing.sm,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: Colors.blue500,
  },
  editButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: "600",
  },
});
