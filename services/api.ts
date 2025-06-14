import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://trash4app-be.onrender.com";

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem("auth_token");
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = await this.getAuthToken();

    // Explicitly define headers as Record<string, string>
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Network error" }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: "buyer" | "seller";
  }) {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Profile endpoints
  async getProfile() {
    return this.makeRequest("/profile");
  }

  async updateProfile(profileData: {
    full_name: string;
    phone: string;
    whatsapp?: string;
    city?: string;
  }) {
    return this.makeRequest("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async uploadProfileImage(imageUri: string) {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);

    const token = await this.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/profile/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // No error here since it's a new object
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Upload failed" }));
      throw new Error(errorData.detail || "Upload failed");
    }

    return await response.json();
  }

  // Listings endpoints
  async getListings(params?: {
    category?: string;
    location?: string;
    skip?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.location) searchParams.append("location", params.location);
    if (params?.skip) searchParams.append("skip", params.skip.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    return this.makeRequest(`/listings${queryString ? `?${queryString}` : ""}`);
  }

  async getListing(id: string) {
    return this.makeRequest(`/listings/${id}`);
  }

  async getMyListings() {
    return this.makeRequest("/my-listings");
  }

  async createListing(listingData: {
    title: string;
    description: string;
    category: string;
    weight: number;
    price: number;
    location: string;
    whatsapp: string;
    latitude?: number;
    longitude?: number;
  }) {
    return this.makeRequest("/listings", {
      method: "POST",
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(
    id: string,
    listingData: Partial<{
      title: string;
      description: string;
      category: string;
      weight: number;
      price: number;
      location: string;
      whatsapp: string;
      latitude?: number;
      longitude?: number;
    }>
  ) {
    return this.makeRequest(`/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(listingData),
    });
  }

  async deleteListing(id: string) {
    return this.makeRequest(`/listings/${id}`, {
      method: "DELETE",
    });
  }

  async uploadListingImages(listingId: string, imageUris: string[]) {
    const formData = new FormData();
    imageUris.forEach((uri, index) => {
      formData.append("files", {
        uri,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      } as any);
    });

    const token = await this.getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/listings/${listingId}/upload-images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Upload failed" }));
      throw new Error(errorData.detail || "Upload failed");
    }

    return await response.json();
  }

  async purchaseListing(id: string) {
    return this.makeRequest(`/listings/${id}/purchase`, {
      method: "POST",
    });
  }

  // Wallet endpoints
  async getWallet() {
    return this.makeRequest("/wallet");
  }

  async initiatePayment(amount: number, email: string) {
    return this.makeRequest("/wallet/initiate-payment", {
      method: "POST",
      body: JSON.stringify({ amount, email }),
    });
  }

  async topupWallet(amount: number, reference: string) {
    return this.makeRequest("/wallet/topup", {
      method: "POST",
      body: JSON.stringify({ amount, reference }),
    });
  }

  async requestWithdrawal(withdrawalData: {
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
  }) {
    return this.makeRequest("/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify(withdrawalData),
    });
  }

  // Location endpoints
  async searchLocation(query: string) {
    return this.makeRequest(
      `/location/search?query=${encodeURIComponent(query)}`
    );
  }
}

export const apiService = new ApiService();
