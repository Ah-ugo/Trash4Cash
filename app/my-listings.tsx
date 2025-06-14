"use client";

import { Colors, Typography } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import type { ApiListing } from "@/types/api";
import { Feather } from "@expo/vector-icons";
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

export default function MyListingsScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const data = await apiService.getMyListings();
      setListings(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch your listings");
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
              await apiService.deleteListing(listingId);
              setListings((prevListings) =>
                prevListings.filter((listing) => listing._id !== listingId)
              );
              Alert.alert("Success", "Listing deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete listing");
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
        return Colors.success;
      case "sold":
        return Colors.info;
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
          onPress={() => router.push("/(tabs)/sell")}
          style={styles.addButton}
        >
          <Feather name="plus" size={20} color={Colors.white} />

          {/* <Plus size={20} color={Colors.white} /> */}
          <Text style={styles.addButtonText}>Add New</Text>
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
              onPress={() => router.push("/(tabs)/sell")}
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
                        <Feather name="edit" size={16} color={Colors.white} />

                        {/* <Edit size={16} color={Colors.white} /> */}
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
                          <>
                            <Feather
                              name="trash-2"
                              size={16}
                              color={Colors.white}
                            />

                            {/* <Trash2 size={16} color={Colors.white} /> */}
                            <Text style={styles.deleteButtonText}>Delete</Text>
                          </>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    ...Typography.h2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    ...Typography.caption,
    color: Colors.white,
    marginLeft: 4,
    fontFamily: "Inter-SemiBold",
  },
  listingsContainer: {
    flex: 1,
  },
  listingsContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.gray500,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  listingsGrid: {
    gap: 16,
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  listingImageContainer: {
    position: "relative",
    height: 200,
  },
  listingImage: {
    width: "100%",
    height: "100%",
  },
  listingImagePlaceholder: {
    width: "100%",
    height: "100%",
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
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontFamily: "Inter-SemiBold",
  },
  listingContent: {
    padding: 16,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  listingTitle: {
    ...Typography.h4,
    flex: 1,
    marginRight: 8,
  },
  listingPrice: {
    ...Typography.h4,
    color: Colors.primary,
  },
  listingDescription: {
    ...Typography.body,
    color: Colors.gray600,
    marginBottom: 12,
    lineHeight: 20,
  },
  listingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: Colors.info,
  },
  editButtonText: {
    ...Typography.caption,
    color: Colors.white,
    marginLeft: 4,
    fontFamily: "Inter-SemiBold",
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    ...Typography.caption,
    color: Colors.white,
    marginLeft: 4,
    fontFamily: "Inter-SemiBold",
  },
});
