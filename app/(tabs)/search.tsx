"use client";

import { router } from "expo-router";
import { Filter, Search as SearchIcon, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ScrapItemCard from "../../components/home/ScrapItemCard";
import { Colors, Typography } from "../../constants/Colors";
import { SCRAP_CATEGORIES } from "../../constants/ScrapCategories";
import { apiService } from "../../services/api";
import type { ScrapCategory, SearchFilters } from "../../types";
import type { ApiListing } from "../../types/api";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const params: any = { limit: 50 };
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;

      const data = await apiService.getListings(params);
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

  const applyFilters = (items: ApiListing[]) => {
    let filtered = items.filter((item) => item.status === "active");

    // Search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((item) => item.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((item) => item.price <= filters.maxPrice!);
    }

    // Weight range filter
    if (filters.minWeight !== undefined) {
      filtered = filtered.filter((item) => item.weight >= filters.minWeight!);
    }
    if (filters.maxWeight !== undefined) {
      filtered = filtered.filter((item) => item.weight <= filters.maxWeight!);
    }

    return filtered;
  };

  const filteredItems = applyFilters(listings);
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  const clearFilters = () => {
    setFilters({});
    fetchListings();
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFiltersAndFetch = () => {
    setShowFilters(false);
    fetchListings();
  };

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
      isVerified: false,
      profileImage: "/placeholder.svg?height=40&width=40",
    },
    datePosted: apiListing.created_at,
    isFeatured: false,
    status: apiListing.status as "active" | "sold" | "pending",
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Scrap Items</Text>
      </View> */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={Colors.gray400} />
          <Input
            value={searchQuery}
            marginBottom
            onChangeText={setSearchQuery}
            placeholder="Search for scrap materials..."
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFiltersCount > 0 && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter
            size={20}
            color={activeFiltersCount > 0 ? Colors.white : Colors.dark}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filtersPanelHeader}>
            <Text style={styles.filtersPanelTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilters}
          >
            {SCRAP_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryChip,
                  filters.category === category.key &&
                    styles.categoryChipActive,
                ]}
                onPress={() =>
                  updateFilter(
                    "category",
                    filters.category === category.key ? undefined : category.key
                  )
                }
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    filters.category === category.key &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.filterRow}>
            <Input
              label="Min Price (₦)"
              value={filters.minPrice?.toString() || ""}
              onChangeText={(value) =>
                updateFilter(
                  "minPrice",
                  value ? Number.parseFloat(value) : undefined
                )
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfInput}
            />
            <Input
              label="Max Price (₦)"
              value={filters.maxPrice?.toString() || ""}
              onChangeText={(value) =>
                updateFilter(
                  "maxPrice",
                  value ? Number.parseFloat(value) : undefined
                )
              }
              placeholder="1,000,000"
              keyboardType="numeric"
              style={styles.halfInput}
            />
          </View>

          <Input
            label="Location"
            value={filters.location || ""}
            onChangeText={(value) => updateFilter("location", value)}
            placeholder="Enter city or state"
          />

          <View style={styles.filterActions}>
            <Button
              title="Clear Filters"
              onPress={clearFilters}
              variant="outline"
              size="medium"
              style={styles.clearButton}
            />
            <Button
              title="Apply Filters"
              onPress={applyFiltersAndFetch}
              variant="primary"
              size="medium"
              style={styles.applyButton}
            />
          </View>
        </View>
      )}

      {/* Results */}
      <ScrollView
        style={styles.results}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
          {activeFiltersCount > 0 && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear all filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading listings...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No items found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {filteredItems.map((item) => (
              <ScrapItemCard
                key={item._id}
                item={convertToScrapItem(item)}
                onPress={() => router.push(`/listing/${item._id}`)}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 50,
  },
  headerTitle: {
    ...Typography.h2,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    paddingTop: 50,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    maxHeight: 60,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    borderWidth: 0,
    // height: "100%",
    height: 60,
    backgroundColor: "transparent",
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
  },
  filtersPanel: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  filtersPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filtersPanelTitle: {
    ...Typography.h4,
  },
  categoryFilters: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.gray600,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  halfInput: {
    flex: 0.48,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clearButton: {
    flex: 0.48,
  },
  applyButton: {
    flex: 0.48,
  },
  results: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    ...Typography.body,
    color: Colors.gray600,
  },
  clearFiltersText: {
    ...Typography.body,
    color: Colors.primary,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.gray500,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  itemsList: {
    paddingHorizontal: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});
