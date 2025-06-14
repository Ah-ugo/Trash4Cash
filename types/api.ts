export interface ApiUser {
  _id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "buyer" | "seller" | "admin";
  wallet_balance: number;
  profile_image?: string;
  whatsapp?: string;
  city?: string;
  is_banned: boolean;
  created_at: string;
}

export interface ApiListing {
  _id: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  whatsapp: string;
  status: "active" | "sold" | "banned" | "deleted";
  created_at: string;
  updated_at?: string;
  sold_at?: string;
  buyer_id?: string;
}

export interface ApiTransaction {
  _id: string;
  user_id: string;
  type: "purchase" | "sale" | "wallet_topup" | "withdrawal";
  amount: number;
  description: string;
  listing_id?: string;
  reference?: string;
  created_at: string;
}

export interface ApiWallet {
  balance: number;
  recent_transactions: ApiTransaction[];
}
