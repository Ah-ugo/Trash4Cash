import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Colors, Typography } from "../../constants/Colors";
import { SCRAP_CATEGORIES } from "../../constants/ScrapCategories";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import type { ScrapCategory } from "../../types";

export default function SellScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ScrapCategory | "",
    weight: "",
    price: "",
    location: "",
    whatsapp: user?.whatsapp || user?.phone || "",
    images: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    if (formData.images.length >= 5) {
      Alert.alert("Limit Reached", "You can only add up to 5 images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateFormData("images", [...formData.images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (formData.images.length >= 5) {
      Alert.alert("Limit Reached", "You can only add up to 5 images");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateFormData("images", [...formData.images, result.assets[0].uri]);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocationCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        updateFormData("location", `${addr.city}, ${addr.region}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData("images", newImages);
  };

  const handleSubmit = async () => {
    const {
      title,
      description,
      category,
      weight,
      price,
      location,
      whatsapp,
      images,
    } = formData;

    if (
      !title ||
      !description ||
      !category ||
      !weight ||
      !price ||
      !location ||
      !whatsapp
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return;
    }

    setLoading(true);

    try {
      // Create listing first
      const listingData = {
        title,
        description,
        category,
        weight: Number.parseFloat(weight),
        price: Number.parseFloat(price),
        location,
        whatsapp,
        latitude: locationCoords?.latitude,
        longitude: locationCoords?.longitude,
      };

      const response = await apiService.createListing(listingData);

      // Upload images
      if (images.length > 0) {
        await apiService.uploadListingImages(response.listing_id, images);
      }

      Alert.alert("Success", "Your item has been listed successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setFormData({
              title: "",
              description: "",
              category: "" as ScrapCategory | "",
              weight: "",
              price: "",
              location: "",
              whatsapp: user?.whatsapp || user?.phone || "",
              images: [],
            });
            setLocationCoords(null);
            router.push("/my-listings");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sell Your Scrap</Text>
        <Text style={styles.headerSubtitle}>Turn your waste into cash</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos *</Text>
          <Text style={styles.sectionSubtitle}>
            Add up to 5 photos of your item
          </Text>

          <View style={styles.imageContainer}>
            {formData.images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={Colors.white}
                  />
                </TouchableOpacity>
              </View>
            ))}

            {formData.images.length < 5 && (
              <View style={styles.addImageButtons}>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImage}
                >
                  <Feather name="image" size={24} color={Colors.gray400} />
                  <Text style={styles.addImageText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={takePhoto}
                >
                  <Feather name="camera" size={24} color={Colors.gray400} />
                  <Text style={styles.addImageText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Input
            label="Title *"
            value={formData.title}
            onChangeText={(value) => updateFormData("title", value)}
            placeholder="e.g. Used Car Engine Parts"
          />

          <Input
            label="Description *"
            value={formData.description}
            onChangeText={(value) => updateFormData("description", value)}
            placeholder="Describe your item in detail..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          {/* Category Selection */}
          <Text style={styles.inputLabel}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {SCRAP_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryOption,
                  formData.category === category.key &&
                    styles.categoryOptionActive,
                ]}
                onPress={() => updateFormData("category", category.key)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    formData.category === category.key &&
                      styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.row}>
            <Input
              label="Weight (kg) *"
              value={formData.weight}
              onChangeText={(value) => updateFormData("weight", value)}
              placeholder="0"
              keyboardType="numeric"
              containerStyles={{ flex: 0.48 }}
              style={styles.halfInput}
            />
            <Input
              label="Price (₦) *"
              value={formData.price}
              onChangeText={(value) => updateFormData("price", value)}
              placeholder="0"
              containerStyles={{ flex: 0.48 }}
              keyboardType="numeric"
              style={styles.halfInput}
            />
          </View>

          <View style={styles.locationRow}>
            <Input
              label="Location *"
              value={formData.location}
              onChangeText={(value) => updateFormData("location", value)}
              placeholder="Enter your city/state"
              containerStyles={{ flex: 1 }}
              style={[styles.locationInput]}
            />
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.locationButton}
            >
              <Feather name="map-pin" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Input
            label="WhatsApp Number *"
            value={formData.whatsapp}
            onChangeText={(value) => updateFormData("whatsapp", value)}
            placeholder="e.g., +2348012345678"
            keyboardType="phone-pad"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title="List Item for Sale"
            onPress={handleSubmit}
            loading={loading}
            size="large"
            style={styles.submitButton}
          />
          <Text style={styles.submitNote}>
            By listing this item, you agree to our terms and conditions
          </Text>
        </View>

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
    marginTop: 50,
  },
  headerTitle: {
    ...Typography.h2,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
    marginBottom: 16,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
    width: 100,
    height: 100,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray100,
  },
  addImageText: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputLabel: {
    ...Typography.bodySemiBold,
    color: Colors.dark,
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryOption: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
    minWidth: 100,
  },
  categoryOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    ...Typography.caption,
    color: Colors.gray600,
    textAlign: "center",
  },
  categoryLabelActive: {
    color: Colors.white,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    // justifyContent: "space-between",
  },
  halfInput: {
    // flex: 0.48,
    // width: "100%",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "center",
    gap: 12,
  },
  locationInput: {
    flex: 1,
    width: "100%",
  },
  locationButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    // alignItems
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  submitSection: {
    marginTop: 16,
  },
  submitButton: {
    marginBottom: 16,
  },
  submitNote: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 40,
  },
});
