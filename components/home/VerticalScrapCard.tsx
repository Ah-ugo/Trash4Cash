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

export const VerticalScrapCard: React.FC<ScrapItemCardProps> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity style={verticalStyles.container} onPress={onPress}>
      <View style={verticalStyles.imageContainer}>
        <Image
          source={{ uri: item.images[0] }}
          style={verticalStyles.image}
          resizeMode="cover"
        />
        <View
          style={[
            verticalStyles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Text style={verticalStyles.categoryText}>
            {item.category.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={verticalStyles.content}>
        <View style={verticalStyles.header}>
          <Text style={verticalStyles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={verticalStyles.price}>{formatPrice(item.price)}</Text>
        </View>

        <Text style={verticalStyles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={verticalStyles.detailsRow}>
          <View style={verticalStyles.weightContainer}>
            <Feather name="package" size={14} color={Colors.gray500} />
            <Text style={verticalStyles.weight}>{item.weight}kg</Text>
          </View>

          <View style={verticalStyles.locationContainer}>
            <Feather name="map-pin" size={14} color={Colors.gray500} />
            <Text style={verticalStyles.location} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={verticalStyles.footer}>
          <View style={verticalStyles.sellerContainer}>
            <Feather name="user" size={14} color={Colors.gray500} />
            <Text style={verticalStyles.sellerName} numberOfLines={1}>
              {item.seller.name}
            </Text>
          </View>
          <Text style={verticalStyles.date}>{formatDate(item.datePosted)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const windowWidth = Dimensions.get("window").width;

const verticalStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
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
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: "600",
    fontSize: 11,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    ...Typography.bodySemiBold,
    fontSize: 16,
    flex: 1,
    marginRight: 12,
    color: Colors.textPrimary,
  },
  price: {
    ...Typography.bodySemiBold,
    color: Colors.primary,
    fontSize: 16,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  weight: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  location: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sellerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sellerName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  date: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
