export type ScrapCategory =
  | "plastic"
  | "metal"
  | "paper"
  | "glass"
  | "electronics"
  | "textiles"
  | "organic"
  | "other";

export interface ScrapItem {
  id: string;
  title: string;
  description: string;
  category: ScrapCategory;
  price: number;
  weight: number;
  location: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    isVerified: boolean;
    profileImage: string;
  };
  datePosted: string;
  isFeatured: boolean;
  status: "active" | "sold" | "pending";
}

export interface SearchFilters {
  category?: ScrapCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  minWeight?: number;
  maxWeight?: number;
}

export interface WalletTransaction {
  id: string;
  type: "topup" | "payment" | "withdrawal";
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  location: string;
  isVerified: boolean;
  rating: number;
  joinedDate: string;
}
