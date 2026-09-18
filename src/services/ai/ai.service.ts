import OpenAI from "openai";

// 🎯 ১. OpenRouter API Keys Array Filter (খালি কি বাদ দেওয়ার জন্য)
const API_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

// 🎯 ২. OpenRouter-এর জন্য স্ট্যান্ডার্ড ফ্রি/ফাস্ট মডেল
const OPENROUTER_MODEL = "google/gemini-2.5-flash";

/**
 * Key Rotation সহ OpenAI/OpenRouter Client তৈরির হেল্পার
 */
const getOpenAIClient = (): OpenAI => {
  const apiKey =
    API_KEYS[currentKeyIndex] || process.env.OPENROUTER_API_KEY_1 || "";

  // পরবর্তী কলের জন্য index ঘুরিয়ে দেওয়া (Key Rotation)
  if (API_KEYS.length > 0) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
      "X-Title": "VenRaz Ecommerce",
    },
  });
};

/**
 * 1. AI Product Description & Auto-Category Generator
 */
export const generateProductDescriptionService = async (
  title: string,
  category?: string,
  keywords?: string[],
  language: string = "en",
) => {
  const isBengali =
    language.toLowerCase() === "bn" || language.toLowerCase() === "bangla";
  const targetLanguage = isBengali ? "Bengali (বাংলা)" : "English";

  const prompt = `
You are an expert e-commerce copywriter. Write a compelling, SEO-optimized product description and bullet points strictly in ${targetLanguage} based on the details below.

Product Title: ${title}
Category: ${category || "General"}
Key Features/Keywords: ${keywords?.join(", ") || "High quality, authentic"}

IMPORTANT: The output values for "description" and "highlights" MUST be strictly in ${targetLanguage}.

Return ONLY a valid JSON object matching this schema:
{
  "description": "Product description in ${targetLanguage}",
  "highlights": ["Highlight 1 in ${targetLanguage}", "Highlight 2 in ${targetLanguage}"],
  "suggestedCategory": "Single best category name based on title (e.g. Organic Food, Grocery, Electronics)"
}
`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 550,
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("AI থেকে সঠিক রেসপন্স পাওয়া যায়নি।");
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Description Generation Error:", error);
    throw error;
  }
};

/**
 * 2. AI Smart Search & Query Parser (Enhanced Number & Price Support)
 */
export const parseSearchQueryWithAI = async (userQuery: string) => {
  const prompt = `
Analyze this e-commerce search query: "${userQuery}".
Extract intent, keywords, brand, category, and target price / price range.

Rules:
1. If the input is ONLY a number or exact price (e.g., "334", "334 tk", "under 500"), set "exactPrice" or "maxPrice" accordingly, and set "searchKeyword" to empty string ("").
2. If it contains product/brand names along with price (e.g. "Samsung under 20000"), extract "searchKeyword" as "Samsung" and "maxPrice" as 20000.
3. Extract category or brand if explicitly mentioned or strongly implied.

Return ONLY a JSON object matching this schema:
{
  "searchKeyword": "Main keyword/brand without price terms (or empty string if only price was searched)",
  "category": "Extracted category or empty string",
  "brand": "Extracted brand name or empty string",
  "exactPrice": null,
  "minPrice": null,
  "maxPrice": null
}
`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 550,
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      return {
        searchKeyword: userQuery,
        category: "",
        brand: "",
        exactPrice: !isNaN(Number(userQuery)) ? Number(userQuery) : null,
        minPrice: null,
        maxPrice: null,
      };
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Search Parse Error:", error);
    const isNumber = !isNaN(Number(userQuery));
    return {
      searchKeyword: isNumber ? "" : userQuery,
      category: "",
      brand: "",
      exactPrice: isNumber ? Number(userQuery) : null,
      minPrice: null,
      maxPrice: null,
    };
  }
};

/**
 * 3. AI Product Auto Background Selector
 */
export const suggestBestBackground = async (
  productTags: string[],
  availableBackgrounds: string[],
) => {
  if (
    !productTags ||
    productTags.length === 0 ||
    !availableBackgrounds ||
    availableBackgrounds.length === 0
  ) {
    return availableBackgrounds?.[0] || "minimal_studio_bg";
  }

  const prompt = `
You are an expert e-commerce product visual designer.
Based on these product tags: [${productTags.join(", ")}], 
select the single BEST matching background ID from this list: ${JSON.stringify(availableBackgrounds)}.

Return ONLY a JSON object:
{
  "selectedBg": "chosen_background_id_from_list"
}
`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 50,
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) return availableBackgrounds[0];

    const parsed = JSON.parse(responseText);
    return parsed.selectedBg || availableBackgrounds[0];
  } catch (error) {
    console.error("AI Background Suggestion Error:", error);
    return availableBackgrounds[0];
  }
};
