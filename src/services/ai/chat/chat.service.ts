import OpenAI from "openai";
import { AIIntentResult, IChatPayload } from "./chat.interface";
import { getAllProductsFromDB } from "../../../models/products/product.service";
import { WishlistService } from "../../../models/wishlist/wishlist.service";
import { CartServices } from "../../../models/card/cart.service";
import {
  ChatMessage,
  ChatMessageType,
  IChatMessage,
} from "./chatHistory.model";

// 🎯 ১. সবকটি API Key একটি অ্যারেতে রাখা
const API_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
]
  .map((key) => key?.trim())
  .filter(
    (key): key is string =>
      Boolean(key) && key !== "undefined" && key !== "null" && key !== "",
  );

// 🎯 ২. OpenAI/OpenRouter ক্লায়েন্ট হেলপার
const getOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": `${process.env.BETTER_AUTH_URL}`,
      "X-Title": "VenRaz Ecommerce",
    },
  });
};

// 🎯 ৩. API Key Rotate করে রিকোয়েস্ট পাঠানোর ফাংশন
const callAIWithKeyRotation = async (
  message: string,
  history: IChatMessage[] = [],
): Promise<string> => {
  if (API_KEYS.length === 0) {
    throw new Error(
      "No OpenRouter API Keys provided in environment variables!",
    );
  }

  let lastError: any = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    const currentApiKey = API_KEYS[i];
    console.log(`🤖 Attempting AI Request with API Key #${i + 1}...`);

    try {
      const client = getOpenAIClient(currentApiKey);

      const response = await client.chat.completions.create({
        model: "google/gemini-2.5-flash", // 👈 OpenRouter-এর সঠিক ও দ্রুত মডেল আইডি
        messages: [
          {
            role: "system",
            content: `You are the AI Shopping Assistant for "VenRaz", a modern e-commerce platform in Bangladesh. 
Analyze user messages (Bangla, Banglish, or English) and context from conversation history.
Convert user intentions into structured JSON.
Keep Bangla replies concise, friendly, and under 50 words.

CRITICAL HISTORY & CONTEXT RULES:
- Read recent conversation history (both user and assistant messages) carefully.
- If the user asks about specifications, price, details, or opinion (e.g., "ata spacification ki?", "details ki?", "price koto?", "kemon hobe?"):
  1. Identify the product name mentioned in the MOST RECENT message or product list shown by the assistant.
  2. Set intent to "PRODUCT_ADVICE".
  3. Put that exact product name into "searchParams.searchKeyword" (e.g., "Apple MacBook Air M3").
  4. Provide a short summary or key highlights in "replyText".

Intents:
1. "SEARCH_PRODUCT": Extract searchKeyword, category, minPrice, maxPrice.
2. "PRODUCT_ADVICE": Triggered for specs, details, advice, or follow-up questions about a product. Set searchKeyword with product name.
3. "GET_CART": User wants to view cart.
4. "GET_WISHLIST": User wants to view wishlist.
5. "TRACK_ORDER": User asks about delivery/order ID.
6. "FAQ": Delivery, return, shipping policies.
7. "GENERAL_CHAT": Greetings or general conversation.

You are VenRaz AI, an intelligent e-commerce shopping assistant.

STRICT INSTRUCTIONS FOR INTENT & SEARCH ANALYSIS:
1. Analyze EVERY SINGLE WORD in the user's input before forming a response.
2. Specifically extract:
   - Specific Product Category or Item (e.g., "phone", "t-shirt", "laptop").
   - Exact Budget or Price Limit (e.g., "3000 taka", "under 5000").
   - Brand or Specific Keywords.
3. If the user asks for a product within a budget (e.g., "3000 taka budget phone"):
   - Set "intent" to "SEARCH_PRODUCT".
   - Pass "maxPrice": 3000 and "searchKeyword": "phone".
4. Always respond respectfully in Bengali, acknowledging all requirements mentioned by the user.

Return ONLY raw valid JSON:
{
  "intent": "SEARCH_PRODUCT" | "PRODUCT_ADVICE" | "GET_CART" | "GET_WISHLIST" | "TRACK_ORDER" | "FAQ" | "GENERAL_CHAT",
  "searchParams": {
    "searchKeyword": "string or undefined",
    "category": "string or undefined",
    "minPrice": number or undefined,
    "maxPrice": number or undefined
  },
  "orderId": "string or undefined",
  "faqAnswer": "string or undefined",
  "replyText": "string or undefined"
}`,
          },
          // 🧠 আগের কথোপকথন স্মরণে রাখা (সর্বশেষ ৬টি মেসেজ)
          ...history.slice(-6).map((msg) => {
            const role =
              (msg as any).sender === "user" || msg.sender === "user"
                ? ("user" as const)
                : ("assistant" as const);
            const content = msg.message || (msg as any).content || "";
            return { role, content };
          }),
          {
            role: "user",
            content: message,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 400,
      } as any);

      const content = response.choices[0]?.message?.content;
      if (content) {
        console.log(`✅ Success with API Key #${i + 1}!`);
        return content;
      }
    } catch (error: any) {
      console.warn(`⚠️ API Key #${i + 1} failed:`, error?.message || error);
      lastError = error;
    }
  }

  throw lastError || new Error("All API Keys failed.");
};

// 🎯 ৪. Intent Classification (With Fast-Paths)
const classifyUserIntent = async (
  message: string,
  history: IChatMessage[] = [],
): Promise<AIIntentResult> => {
  const cleanMsg = message.trim().toLowerCase();

  // 🚀 FAST-PATH 1: গ্রিটিংস
  if (/^(hi|hello|hey|হ্যালো|হে|কেমন আছেন|সালাম|hlw)$/i.test(cleanMsg)) {
    return {
      intent: "GENERAL_CHAT",
      replyText: "হ্যালো! VenRaz-এ আপনাকে স্বাগতম। কীভাবে সাহায্য করতে পারি?",
    };
  }

  // 🚀 FAST-PATH 2: সরাসরি প্রোডাক্ট চাওয়ার প্যাটার্ন (যেমন: "watch dau", "shoe dekhaw")
  if (
    /(dau|দাও|dekhaw|দেখাও|chai|চাই|দাম কত|price)/i.test(cleanMsg) &&
    !cleanMsg.includes("cart") &&
    !cleanMsg.includes("wishlist")
  ) {
    const extractedKeyword = cleanMsg
      .replace(/[><"'/\\{}()[\]]/g, "") // স্পেশাল সিম্বল রিমুভ
      .replace(
        /(dau|দাও|dekhaw|দেখাও|chai|চাই|ekta|একটা|koto|কত|price|atar|এটার|দাম)/gi,
        "",
      )
      .trim();

    if (extractedKeyword.length > 0) {
      return {
        intent: "SEARCH_PRODUCT",
        searchParams: { searchKeyword: extractedKeyword },
      };
    }
  }

  // 🚀 FAST-PATH 3: কার্ট এবং উইশলিস্ট
  if (/cart|কার্ট|ঝুড়ি/i.test(cleanMsg) && !cleanMsg.includes("add")) {
    return { intent: "GET_CART" };
  }
  if (/wishlist|উইশলিস্ট|পছন্দ/i.test(cleanMsg) && !cleanMsg.includes("add")) {
    return { intent: "GET_WISHLIST" };
  }

  // 🚀 FAST-PATH 4: FAQ
  if (
    cleanMsg.includes("ডেলিভারি") ||
    cleanMsg.includes("delivery") ||
    cleanMsg.includes("শিপিং")
  ) {
    return {
      intent: "FAQ",
      faqAnswer:
        "VenRaz-এ ঢাকার ভেতরে ক্যাশ অন ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। সাধারণত ২-৪ কার্যদিবসের মধ্যে অর্ডার ডেলিভারি করা হয়।",
    };
  }

  // 🤖 AI Processing
  try {
    let rawText = await callAIWithKeyRotation(message, history);

    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
    }

    return JSON.parse(rawText) as AIIntentResult;
  } catch (error) {
    console.error("AI Classification Error, Fallback Triggered:", error);
    return {
      intent: "SEARCH_PRODUCT",
      searchParams: { searchKeyword: message },
    };
  }
};

// 🎯 ৫. মেইন চ্যাট সার্ভিস প্রসেসর
export const processChatMessageService = async (payload: IChatPayload) => {
  const { message, history, userFrequentCategory, userId } = payload;
  console.log("Incoming Payload:", { message, userId });

  // ১. ইউজারের মেসেজ ডাটাবেজে সেভ
  if (userId) {
    await ChatMessage.create({
      userId,
      sender: "user",
      message: message,
      type: "TEXT" as ChatMessageType,
    });
  }

  // ২. AI Intent Parse করা
  const aiParsed = await classifyUserIntent(message, history);
  console.log("AI Parsed Result:", aiParsed);

  let botResponse: {
    reply: string;
    type: ChatMessageType;
    data?: any;
  } = {
    reply:
      "হ্যালো! VenRaz ই-কমার্সে আপনাকে স্বাগতম। আজ কীভাবে সাহায্য করতে পারি?",
    type: "TEXT" as ChatMessageType,
    data: null,
  };

  // 🛒 Intent 1: GET_CART
  if (aiParsed.intent === "GET_CART") {
    if (!userId) {
      botResponse = {
        reply: "আপনার কার্টের আইটেমগুলো দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।",
        type: "TEXT",
      };
    } else {
      const cartData = await CartServices.getCartFromDB(userId);
      const products = cartData?.items || [];
      botResponse = {
        reply:
          products.length > 0
            ? "আপনার কার্টে থাকা প্রোডাক্টগুলো নিচে দেওয়া হলো:"
            : "আপনার কার্টটি বর্তমানে খালি রয়েছে।",
        type: "PRODUCT_LIST",
        data: products,
      };
    }
  }

  // 💖 Intent 2: GET_WISHLIST
  else if (aiParsed.intent === "GET_WISHLIST") {
    if (!userId) {
      botResponse = {
        reply:
          "আপনার উইশলিস্টের প্রোডাক্টগুলো দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।",
        type: "TEXT",
      };
    } else {
      const wishlistData = await WishlistService.getWishlistFromDB(userId);
      const products = (wishlistData?.productIds as any) || [];
      botResponse = {
        reply:
          products.length > 0
            ? "আপনার পছন্দের উইশলিস্ট প্রোডাক্টগুলো নিচে দেওয়া হলো:"
            : "আপনার উইশলিস্টে কোনো প্রোডাক্ট যুক্ত করা নেই।",
        type: "PRODUCT_LIST",
        data: products,
      };
    }
  }

  // 💡 Intent 3: PRODUCT_ADVICE
  else if (aiParsed.intent === "PRODUCT_ADVICE") {
    let queryTerm = aiParsed.searchParams?.searchKeyword?.trim();

    // 🎯 ব্যাকআপ লজিক: AI যদি কি-ওয়ার্ড না পায়, তবে চ্যাট হিস্ট্রি স্ক্যান করে আগের প্রোডাক্ট বের করবে
    if (!queryTerm || queryTerm.length === 0) {
      const lastBotMsg = [...(history ?? [])]
        .reverse()
        .find((h) => h.sender === "bot" || (h as any).role === "assistant");
      if (lastBotMsg && lastBotMsg.message) {
        // মেসেজ থেকে স্পেশাল চিহ্ন রিমুভ করে সার্চ কি-ওয়ার্ড খোঁজা
        queryTerm = lastBotMsg.message.replace(/[><"'/\\{}()[\]]/g, "").trim();
      }
    }

    // চূড়ান্ত সার্চ টার্ম পরিষ্কার করা
    queryTerm = (queryTerm || message).replace(/[><"'/\\{}()[\]]/g, "").trim();

    const productData = await getAllProductsFromDB({
      search: queryTerm,
      limit: "1",
    });

    const matchedProduct = productData?.products?.[0];

    let replyMessage = aiParsed.replyText;

    // যদি ডাটাবেজে প্রোডাক্ট পাওয়া যায় এবং AI নিজস্ব বিবরণ না দেয়
    if (matchedProduct) {
      replyMessage = `**${matchedProduct.name}** এর বিবরণ:\n${
        matchedProduct.description || "এটি একটি প্রিমিয়াম মানের প্রোডাক্ট।"
      }`;
    }

    botResponse = {
      reply:
        replyMessage ||
        `দুঃখিত, "${queryTerm}" সম্পর্কিত স্পেসিফিকেশন পাওয়া যায়নি।`,
      type: "TEXT", // স্পেসিফিকেশনের জন্য সরাসরি টেক্সট রেসপন্স
      data: matchedProduct ? [matchedProduct] : [],
    };
  }

  // 🛍️ Intent 4: SEARCH_PRODUCT
  else if (aiParsed.intent === "SEARCH_PRODUCT") {
    const searchParams = aiParsed.searchParams || {};
    let rawKeyword = (searchParams.searchKeyword || message)
      .replace(/[><"'/\\{}()[\]]/g, "")
      .trim();

    // searchKeyword না থাকলে সরাসরি মেসেজকেই সার্চ টার্ম হিসেবে ধরা হবে
    const queryTerm =
      rawKeyword.length > 0
        ? rawKeyword
        : message.replace(/[><"'/\\{}()[\]]/g, "").trim();

    const productData = await getAllProductsFromDB({
      search: queryTerm,
      category: searchParams.category,
      minPrice: searchParams.minPrice
        ? String(searchParams.minPrice)
        : undefined,
      maxPrice: searchParams.maxPrice
        ? String(searchParams.maxPrice)
        : undefined,
      userFrequentCategory: userFrequentCategory,
      limit: "6",
    });

    const hasProducts =
      productData?.products && productData.products.length > 0;

    botResponse = {
      reply: hasProducts
        ? `আপনার পছন্দের ওপর ভিত্তি করে VenRaz-এর কিছু বেস্ট ${queryTerm} নিচে দেওয়া হলো:`
        : `দুঃখিত, "${queryTerm}" সম্পর্কিত কোনো প্রোডাক্ট পাওয়া যায়নি।`,
      type: "PRODUCT_LIST",
      data: productData?.products || [],
    };
  }

  // 📦 Intent 5: TRACK_ORDER
  else if (aiParsed.intent === "TRACK_ORDER") {
    const orderId = aiParsed.orderId;
    if (!orderId) {
      botResponse = {
        reply:
          "আপনার অর্ডার ট্র্যাক করতে অনুগ্রহ করে সঠিক অর্ডার আইডিটি (যেমন: #12345) লিখুন।",
        type: "TEXT",
      };
    } else {
      botResponse = {
        reply: `আপনার অর্ডারটি (#${orderId}) প্রসেসিং অবস্থায় রয়েছে। খুব শীঘ্রই ডেলিভারি পার্টনারের কাছে হস্তান্তর করা হবে।`,
        type: "ORDER_STATUS",
        data: { orderId, status: "Processing" },
      };
    }
  }

  // ❓ Intent 6: FAQ
  else if (aiParsed.intent === "FAQ") {
    botResponse = {
      reply:
        aiParsed.faqAnswer ||
        "VenRaz সম্পর্কিত অতিরিক্ত তথ্যের জন্য আমাদের সাপোর্ট সেন্টারে যোগাযোগ করতে পারেন।",
      type: "TEXT",
    };
  }

  // 💬 Intent 7: GENERAL_CHAT
  else {
    botResponse = {
      reply:
        aiParsed.replyText ||
        "হ্যালো! VenRaz ই-কমার্সে আপনাকে স্বাগতম। আজ কীভাবে সাহায্য করতে পারি?",
      type: "TEXT",
    };
  }

  // ৩. AI-এর রেসপন্স ডাটাবেজে সেভ
  if (userId) {
    await ChatMessage.create({
      userId,
      sender: "bot",
      message: botResponse.reply,
      type: botResponse.type,
      data: botResponse.data,
    });
  }

  return botResponse;
};
