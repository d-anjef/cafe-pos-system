const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn("⚠️ GEMINI_API_KEY not set — menu AI feature disabled");
}

// ============================================================
// EXTRACTION PROMPT
// ============================================================
const EXTRACTION_PROMPT = `You are an expert at reading restaurant and café menus from images.

Analyze this menu image and extract ALL items you can see. Return ONLY a JSON object (no markdown, no explanation) in this EXACT structure:

{
  "categories": [
    {
      "name": "Beverages",
      "icon": "☕",
      "items": [
        {
          "name": "Cappuccino",
          "price": 180,
          "description": "Rich espresso with steamed milk",
          "confidence": 0.95
        }
      ]
    }
  ],
  "metadata": {
    "totalItems": 0,
    "totalCategories": 0,
    "currency": "NPR",
    "language": "English"
  }
}

RULES:
1. Extract EVERY visible menu item with prices
2. Prices should be NUMBERS only (no currency symbols)
3. If price seems to be in NPR, keep as-is. If clearly USD/INR, mention in metadata
4. Group items into logical categories (Beverages, Food, Snacks, Desserts, etc.)
5. Use appropriate emoji icons: ☕ for Coffee, 🍵 for Tea, 🍔 for Burgers, 🍕 for Pizza, 🥗 for Salads, 🍰 for Desserts, 🍝 for Pasta, 🥟 for Momo, 🍜 for Noodles, 🌮 for Mexican, 🍱 for Asian, 🥤 for Cold Drinks, 🍞 for Bakery, 🥪 for Sandwiches
6. Confidence: 0.0-1.0 (how sure you are about the extraction)
7. If you can't see price clearly, skip that item
8. Descriptions are optional - only include if visible in menu
9. Clean item names (proper capitalization, no menu numbers/codes)
10. If category isn't clear, use "Other"

IMPORTANT: Return ONLY valid JSON. No markdown blocks. No explanations.`;

// ============================================================
// MAIN FUNCTION: Parse menu image
// ============================================================
async function parseMenuImage(imageBuffer, mimeType = "image/jpeg") {
  if (!genAI) {
    throw new Error("Gemini AI not configured. Set GEMINI_API_KEY in .env");
  }

  try {
    // Use Gemini 2.0 Flash (free, fast, vision-capable)
   const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,  // Lower = more consistent
        responseMimeType: "application/json"
      }
    });

    // Convert image buffer to base64
    const base64Image = imageBuffer.toString("base64");

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    console.log("[MenuAI] Sending image to Gemini...");
    const startTime = Date.now();

    const result = await model.generateContent([EXTRACTION_PROMPT, imagePart]);
    const response = result.response;
    const text = response.text();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[MenuAI] ✅ Response received in ${duration}s`);

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      console.error("[MenuAI] JSON parse error:", parseErr);
      console.error("[MenuAI] Raw response:", text.substring(0, 500));
      throw new Error("AI returned invalid format. Try a clearer image.");
    }

    // Validate structure
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      throw new Error("AI couldn't detect any menu items. Try a clearer image.");
    }

    // Calculate totals
    const totalItems = parsed.categories.reduce(
      (sum, cat) => sum + (cat.items?.length || 0),
      0
    );

    if (totalItems === 0) {
      throw new Error("No menu items detected in the image. Try a clearer menu photo.");
    }

    // Add metadata
    parsed.metadata = {
      ...parsed.metadata,
      totalItems,
      totalCategories: parsed.categories.length,
      processingTime: `${duration}s`
    };

    console.log(`[MenuAI] Extracted ${totalItems} items in ${parsed.categories.length} categories`);
    return parsed;

  } catch (err) {
    console.error("[MenuAI] Error:", err);
    throw new Error(err.message || "Failed to parse menu image");
  }
}

module.exports = {
  parseMenuImage
};