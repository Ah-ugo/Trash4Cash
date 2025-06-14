import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Typography } from "../../constants/Colors";
import { ScrapItem } from "../../types";
import CategoryIcon from "../common/CategoryIcon";

interface ScrapItemCardProps {
  item: ScrapItem;
  onPress: () => void;
  styleObj?: object;
  isFeatured?: boolean; // New prop to control layout
}

export default function ScrapItemCard({
  item,
  onPress,
  styleObj,
  isFeatured = false,
}: ScrapItemCardProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, styleObj]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <CategoryIcon category={item.category} size="small" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View
          style={[
            styles.details,
            {
              flex: 1,
              flexDirection: isFeatured ? "column" : "row",
              justifyContent: "space-between",
            },
          ]}
        >
          <View style={[styles.detailRow, !isFeatured && styles.detailRowFlex]}>
            <MaterialCommunityIcons
              name="weight-kilogram"
              size={14}
              color={Colors.gray500}
            />
            <Text style={styles.detailText}>{item.weight}kg</Text>
          </View>
          <View style={[styles.detailRow, !isFeatured && styles.detailRowFlex]}>
            <Feather name="map-pin" size={14} color={Colors.gray500} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={[styles.detailRow, !isFeatured && styles.detailRowFlex]}>
            <Feather name="calendar" size={14} color={Colors.gray500} />
            <Text style={styles.detailText}>{formatDate(item.datePosted)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{item.seller.name}</Text>
            {item.seller.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    ...Typography.caption,
    color: Colors.white,
    fontFamily: "Inter-SemiBold",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    ...Typography.h4,
    marginBottom: 4,
  },
  description: {
    ...Typography.body,
    color: Colors.gray600,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",

    // justifyContent: "space-between",
  },
  detailRowFlex: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
    // justifyContent: "space-between",
  },
  detailText: {
    ...Typography.caption,
    marginLeft: 4,
    color: Colors.gray600,
    flexShrink: 1,
    maxWidth: windowWidth * 0.65,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    ...Typography.h3,
    color: Colors.primary,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerName: {
    ...Typography.caption,
    color: Colors.gray600,
  },
  verifiedBadge: {
    marginLeft: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
});
