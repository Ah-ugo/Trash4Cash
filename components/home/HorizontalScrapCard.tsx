import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ApiListing {
  _id: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
  whatsapp: string;
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  images: string[];
  status: string;
  created_at: string;
}

interface ScrapItemCardProps {
  item: ApiListing;
  onPress: () => void;
  variant?: "horizontal" | "vertical";
}

const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    color: Colors.dark,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
    color: Colors.dark,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
    color: Colors.dark,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
    color: Colors.dark,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    color: Colors.dark,
  },
  bodySemiBold: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    color: Colors.dark,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    color: Colors.dark,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    color: Colors.gray600,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "plastic":
      return Colors.blue500;
    case "metal":
      return Colors.gray600;
    case "automotive":
      return Colors.secondary;
    case "paper":
      return Colors.green500;
    case "electronics":
      return Colors.info;
    default:
      return Colors.primary;
  }
};

const formatPrice = (price: number) => {
  return `₦${price.toLocaleString()}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

export const HorizontalScrapCard: React.FC<ScrapItemCardProps> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity style={horizontalStyles.container} onPress={onPress}>
      <View style={horizontalStyles.imageContainer}>
        <Image
          source={{ uri: item.images[0] }}
          style={horizontalStyles.image}
          resizeMode="cover"
        />
        <View
          style={[
            horizontalStyles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Text style={horizontalStyles.categoryText}>
            {item.category.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={horizontalStyles.content}>
        <Text style={horizontalStyles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={horizontalStyles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={horizontalStyles.detailsRow}>
          <View style={horizontalStyles.weightContainer}>
            <Feather name="package" size={12} color={Colors.gray500} />
            <Text style={horizontalStyles.weight}>{item.weight}kg</Text>
          </View>
          <Text style={horizontalStyles.price}>{formatPrice(item.price)}</Text>
        </View>

        <View style={horizontalStyles.footer}>
          <View style={horizontalStyles.locationContainer}>
            <Feather name="map-pin" size={12} color={Colors.gray500} />
            <Text style={horizontalStyles.location} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <Text style={horizontalStyles.date}>
            {formatDate(item?.datePosted)}
          </Text>
        </View>

        <View style={horizontalStyles.sellerContainer}>
          <Feather name="user" size={12} color={Colors.gray500} />
          <Text style={horizontalStyles.sellerName} numberOfLines={1}>
            {item.seller.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const windowWidth = Dimensions.get("window").width;

const horizontalStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 8,
    width: Math.min(280, windowWidth * 0.75),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: "600",
    fontSize: 10,
  },
  content: {
    padding: 12,
  },
  title: {
    ...Typography.bodySemiBold,
    fontSize: 15,
    marginBottom: 4,
    color: Colors.textPrimary,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontSize: 13,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  weight: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontSize: 11,
  },
  price: {
    ...Typography.bodySemiBold,
    color: Colors.primary,
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  location: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontSize: 11,
  },
  date: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 10,
  },
  sellerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontSize: 11,
  },
});
