"use client";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/AuthContext";
import { Colors } from "../../../styles/colors";
import { Spacing } from "../../../styles/spacing";
import { Typography } from "../../../styles/typography";

const categories = [
  "Plastic",
  "Metal",
  "Paper",
  "Glass",
  "Electronics",
  "Other",
];

interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  weight: number;
  location: string;
  images: string[];
  whatsapp: string;
  latitude?: number;
  longitude?: number;
}

export default function EditListingScreen() {
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    weight: "",
    price: "",
    location: "",
    whatsapp: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(
        `https://trash4app-be.onrender.com/listings/${id}`
      );
      const data = await response.json();

      if (response.ok) {
        setListing(data);
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          weight: data.weight.toString(),
          price: data.price.toString(),
          location: data.location,
          whatsapp: data.whatsapp,
        });
        setImages(data.images || []);
        if (data.latitude && data.longitude) {
          setLocationCoords({
            latitude: data.latitude,
            longitude: data.longitude,
          });
        }
      } else {
        Alert.alert("Error", "Listing not found");
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch listing details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImages(result.assets.map((asset) => asset.uri));
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
        setFormData((prev) => ({
          ...prev,
          location: `${addr.city}, ${addr.region}`,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
    }
  };

  const updateListing = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.weight ||
      !formData.price ||
      !formData.location ||
      !formData.whatsapp
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return;
    }

    setSaving(true);

    try {
      // Update listing
      const listingData = {
        ...formData,
        weight: Number.parseFloat(formData.weight),
        price: Number.parseFloat(formData.price),
        latitude: locationCoords?.latitude,
        longitude: locationCoords?.longitude,
      };

      const response = await fetch(
        `https://trash4app-be.onrender.com/listings/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(listingData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update listing");
      }

      // Check if images have changed
      const hasNewImages =
        !listing?.images ||
        images.length !== listing.images.length ||
        images.some((img) => !img.startsWith("http"));

      if (hasNewImages) {
        // Upload images
        const formDataImages = new FormData();
        images.forEach((imageUri, index) => {
          // Only upload new images (not URLs)
          if (!imageUri.startsWith("http")) {
            formDataImages.append("files", {
              uri: imageUri,
              type: "image/jpeg",
              name: `image_${index}.jpg`,
            } as any);
          }
        });

        const imageResponse = await fetch(
          `https://trash4app-be.onrender.com/listings/${id}/upload-images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataImages,
          }
        );

        if (!imageResponse.ok) {
          throw new Error("Failed to upload images");
        }
      }

      Alert.alert("Success", "Listing updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update listing");
    } finally {
      setSaving(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Listing</Text>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos *</Text>
          <TouchableOpacity
            onPress={pickImages}
            style={styles.imageUploadButton}
          >
            <Text style={styles.imageUploadIcon}>📷</Text>
            <Text style={styles.imageUploadText}>Tap to change photos</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <ScrollView horizontal style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.imagePreview}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title *</Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, title: text }))
            }
            placeholder="e.g., Clean Plastic Bottles"
            style={styles.textInput}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            placeholder="Describe the condition and details..."
            multiline
            numberOfLines={4}
            style={[styles.textInput, styles.textInputMultiline]}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setFormData((prev) => ({ ...prev, category }))}
                style={[
                  styles.categoryButton,
                  formData.category === category
                    ? styles.categoryButtonActive
                    : styles.categoryButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.category === category
                      ? styles.categoryButtonTextActive
                      : styles.categoryButtonTextInactive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Weight and Price */}
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Weight (kg) *</Text>
            <TextInput
              value={formData.weight}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, weight: text }))
              }
              placeholder="0.0"
              keyboardType="numeric"
              style={styles.textInput}
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.sectionTitle}>Price (₦) *</Text>
            <TextInput
              value={formData.price}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, price: text }))
              }
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.textInput}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location *</Text>
          <View style={styles.locationRow}>
            <TextInput
              value={formData.location}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, location: text }))
              }
              placeholder="Enter your city or area"
              style={[styles.textInput, styles.locationInput]}
            />
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.locationButton}
            >
              <Text style={styles.locationButtonText}>📍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WhatsApp */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WhatsApp Number *</Text>
          <TextInput
            value={formData.whatsapp}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, whatsapp: text }))
            }
            placeholder="e.g., +2348012345678"
            keyboardType="phone-pad"
            style={styles.textInput}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={updateListing}
          disabled={saving}
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Update Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.gray600,
    marginTop: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
  },
  title: {
    ...Typography.h2,
    color: Colors.accent,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.gray300,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: "center",
  },
  imageUploadIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  imageUploadText: {
    ...Typography.bodySmall,
    color: Colors.gray600,
    textAlign: "center",
  },
  imagePreviewContainer: {
    marginTop: Spacing.sm,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
  },
  textInputMultiline: {
    height: 100,
  },
  categoryButton: {
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonInactive: {
    backgroundColor: Colors.gray100,
  },
  categoryButtonText: {
    ...Typography.bodySmall,
  },
  categoryButtonTextActive: {
    color: Colors.white,
  },
  categoryButtonTextInactive: {
    color: Colors.gray700,
  },
  row: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    justifyContent: "center",
  },
  locationButtonText: {
    color: Colors.white,
    ...Typography.body,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray400,
  },
  submitButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
