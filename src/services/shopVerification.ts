// ─── Types ──────────────────────────────────────────────────────────────────

export interface ShopVerificationInput {
  shopName: string;
  description: string;
  address: string;
  phone: string;
  logoUrl?: string;
  bannerUrl?: string;
  ownerName: string;
}

export interface VerificationEnhancedData {
  shopName: string;
  description: string;
  tags: string[];
}

export interface VerificationFeedback {
  reason: string;
  issuesFound: string[];
}

export interface VerificationResult {
  status: "approved" | "rejected" | "needs_review";
  trustScore: number;
  enhancedData: VerificationEnhancedData;
  feedback: VerificationFeedback;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PROHIBITED_WORDS = [
  "scam", "fake", "fraud", "hack", "crack", "pirate", "counterfeit",
  "stolen", "illegal", "drugs", "weapon", "porn", "xxx", "gambling",
  "bet", "casino", "loan shark", "money laundering", "terror",
  "bomb", "kill", "murder", "assault", "abuse",
];

const SPAM_PATTERNS = [
  /^(.)\1{4,}$/,
  /^(test|asdf|qwer|zxcv|12345|aaaaa|bbbbb|xxxxx|zzzzz)/i,
  /^[a-z]{1,3}$/i,
  /^\d+$/,
  /^(.)\1+(.)\2+(.)\3+/,
  /^lorem ipsum/i,
  /^hello world/i,
  /^sample|demo|placeholder|temp|tmp/i,
];

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;
const BD_PHONE_WITH_FORMAT = /^(\+?880|0)?1[3-9]\d{8}$/;

const SEO_CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Fashion & Apparel": ["clothing", "fashion", "apparel", "wear", "style", "trendy", "outfit"],
  "Electronics & Gadgets": ["electronics", "gadget", "tech", "device", "digital", "smart", "gadget"],
  "Health & Beauty": ["health", "beauty", "skincare", "wellness", "cosmetic", "organic", "care"],
  "Home & Living": ["home", "living", "decor", "furniture", "interior", "household", "cozy"],
  "Groceries & Gourmet": ["grocery", "food", "gourmet", "organic", "fresh", "market", "kitchen"],
  "Artisanal & Crafts": ["artisan", "craft", "handmade", "handcrafted", "artisanal", "DIY", "creative"],
  "Sports & Outdoors": ["sports", "fitness", "outdoor", "adventure", "athletic", "gym", "active"],
  "Books & Stationery": ["books", "stationery", "reading", "writing", "paper", "office", "study"],
  "Jewelry & Accessories": ["jewelry", "accessories", "bracelet", "necklace", "ring", "fashion", "elegant"],
};

// ─── Validation Helpers ─────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

function isValidBDPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return BD_PHONE_REGEX.test(normalized) || BD_PHONE_WITH_FORMAT.test(normalized);
}

function containsProfanity(text: string): string | null {
  const lower = text.toLowerCase();
  for (const word of PROHIBITED_WORDS) {
    if (lower.includes(word)) {
      return word;
    }
  }
  return null;
}

function isSpamText(text: string): boolean {
  if (text.length < 3) return true;
  return SPAM_PATTERNS.some((p) => p.test(text.trim()));
}

function isMeaningfulText(text: string, minLength = 20): boolean {
  if (text.trim().length < minLength) return false;
  const words = text.trim().split(/\s+/);
  return words.length >= 4;
}

// ─── Enhancement Helpers ────────────────────────────────────────────────────

function enhanceDescription(
  description: string,
  shopName: string,
  category: string
): string {
  let enhanced = description.trim();

  // Capitalize first letter
  if (enhanced.length > 0) {
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
  }

  // Ensure ends with period
  if (!/[.!?]$/.test(enhanced)) {
    enhanced += ".";
  }

  // Fix common grammar issues
  enhanced = enhanced.replace(/\bi\b/g, "I");
  enhanced = enhanced.replace(/\s+/g, " ");

  // Append category context if not present
  const categoryLower = category.toLowerCase();
  if (!enhanced.toLowerCase().includes(categoryLower)) {
    enhanced += ` Explore our curated ${category.toLowerCase()} collection.`;
  }

  return enhanced;
}

function generateTags(shopName: string, category: string): string[] {
  const tags: string[] = [];
  const nameWords = shopName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  // Add name-based tags
  tags.push(...nameWords.slice(0, 3));

  // Add category keywords
  const catKeywords = SEO_CATEGORY_KEYWORDS[category] || [];
  tags.push(...catKeywords.slice(0, 4));

  // Add general e-commerce tags
  tags.push("shop", "online", "marketplace");

  // Deduplicate and limit
  const unique = [...new Set(tags)].slice(0, 8);
  return unique;
}

function cleanShopName(name: string): string {
  let cleaned = name.trim();
  // Remove excessive special characters
  cleaned = cleaned.replace(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>/?]{3,}/g, "");
  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ");
  return cleaned;
}

// ─── Trust Score Calculator ─────────────────────────────────────────────────

function calculateTrustScore(input: ShopVerificationInput): number {
  let score = 0;

  // Shop name quality (0-20)
  if (input.shopName.trim().length >= 3) score += 5;
  if (input.shopName.trim().length >= 8) score += 5;
  if (input.shopName.trim().length >= 15) score += 5;
  if (!isSpamText(input.shopName)) score += 5;

  // Description quality (0-25)
  if (input.description.trim().length >= 20) score += 5;
  if (input.description.trim().length >= 50) score += 5;
  if (input.description.trim().length >= 100) score += 5;
  if (isMeaningfulText(input.description)) score += 5;
  if (!isSpamText(input.description)) score += 5;

  // Phone validation (0-20)
  if (input.phone.trim().length > 0) score += 5;
  if (isValidBDPhone(input.phone)) score += 15;

  // Address quality (0-15)
  if (input.address.trim().length >= 10) score += 5;
  if (input.address.trim().length >= 20) score += 5;
  if (!isSpamText(input.address)) score += 5;

  // Media completeness (0-10)
  if (input.logoUrl && input.logoUrl.trim().length > 0) score += 5;
  if (input.bannerUrl && input.bannerUrl.trim().length > 0) score += 5;

  // Owner name present (0-10)
  if (input.ownerName && input.ownerName.trim().length >= 2) score += 10;

  return Math.min(100, Math.max(0, score));
}

// ─── Main Verification Function ─────────────────────────────────────────────

export const verifyShop = (input: ShopVerificationInput): VerificationResult => {
  const issues: string[] = [];

  // 1. Validate shop name
  const profanity = containsProfanity(input.shopName);
  if (profanity) {
    issues.push(`Shop name contains prohibited word: "${profanity}"`);
  }

  if (isSpamText(input.shopName)) {
    issues.push("Shop name appears to be spam or placeholder text");
  }

  if (input.shopName.trim().length < 3) {
    issues.push("Shop name must be at least 3 characters");
  }

  // 2. Validate phone
  if (!input.phone.trim()) {
    issues.push("Phone number is required");
  } else if (!isValidBDPhone(input.phone)) {
    issues.push("Invalid phone number format (expected 11-digit BD mobile: 01XXXXXXXXX)");
  }

  // 3. Validate description
  if (!input.description.trim()) {
    issues.push("Shop description is required");
  } else if (isSpamText(input.description)) {
    issues.push("Description appears to be spam or dummy text");
  } else if (!isMeaningfulText(input.description)) {
    issues.push("Description is too short or lacks meaningful content");
  }

  // 4. Validate address
  if (!input.address.trim()) {
    issues.push("Shop address is required");
  } else if (isSpamText(input.address)) {
    issues.push("Address appears to be spam or placeholder text");
  } else if (input.address.trim().length < 10) {
    issues.push("Address is too short — please provide a full address");
  }

  // 5. Calculate trust score
  const trustScore = calculateTrustScore(input);

  // 6. Generate enhanced data
  const enhancedShopName = cleanShopName(input.shopName);
  const enhancedDescription = input.description.trim()
    ? enhanceDescription(input.description, input.shopName, "general")
    : "A trusted shop on the VenRaz marketplace offering quality products.";
  const tags = generateTags(input.shopName, "general");

  // 7. Determine status
  let status: "approved" | "rejected" | "needs_review";

  const hasCriticalIssues = issues.some(
    (i) =>
      i.includes("prohibited") ||
      i.includes("spam") ||
      i.includes("Invalid phone")
  );

  if (hasCriticalIssues || trustScore < 30) {
    status = "rejected";
  } else if (trustScore >= 80 && issues.length === 0) {
    status = "approved";
  } else if (trustScore >= 50) {
    status = "needs_review";
  } else {
    status = "rejected";
  }

  // 8. Build reason
  let reason: string;
  if (status === "approved") {
    reason =
      "Shop registration meets all quality standards. Auto-approved for marketplace listing.";
  } else if (status === "rejected") {
    reason =
      "Shop registration failed one or more critical checks. Please address the issues and resubmit.";
  } else {
    reason =
      "Shop registration needs manual review. Some fields may require improvement.";
  }

  return {
    status,
    trustScore,
    enhancedData: {
      shopName: enhancedShopName,
      description: enhancedDescription,
      tags,
    },
    feedback: {
      reason,
      issuesFound: issues,
    },
  };
};
