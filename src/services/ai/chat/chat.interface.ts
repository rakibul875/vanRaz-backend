import { IChatMessage } from "./chatHistory.model";

export type IntentType =
  | "SEARCH_PRODUCT"
  | "PRODUCT_ADVICE"
  | "GET_CART"
  | "GET_WISHLIST"
  | "TRACK_ORDER"
  | "FAQ"
  | "GENERAL_CHAT";

export interface AIIntentResult {
  intent: IntentType;
  searchParams?: {
    searchKeyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  orderId?: string;
  faqAnswer?: string;
  replyText?: string;
}

export interface IChatPayload {
  message: string;
  image?: string;
  userFrequentCategory?: string;
  history?: IChatMessage[];
  userId?: string;
}
