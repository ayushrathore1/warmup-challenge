import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON and URL-encoded parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Gemini API client
  const geminiKey = process.env.GEMINI_API_KEY;
  const ai = geminiKey && geminiKey !== "MY_GEMINI_API_KEY" && geminiKey.trim() !== ""
    ? new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      })
    : null;

  // Prompt configuration
  const systemInstruction = `You are a personal Indian meal planning assistant. Based on the user's day, generate a structured cooking to-do list and return valid JSON adhering strictly to the schema. Do not output any prose, markdown block characters like \`\`\`json, or explanations. Just return the JSON object directly.`;

  // API endpoint to generate the food planning structured JSON
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { dayDescription, budgetPreference, dietaryPreference, servings = 2 } = req.body;

      if (!dayDescription) {
        return res.status(400).json({ error: "Day description is required." });
      }

      const promptMsg = `
Based on the user's input, generate a personalized kitchen plan in INR (₹).

User Parameters:
- Day's description/schedule: "${dayDescription}"
- Budget preference: ${budgetPreference || 'any'}
- Dietary preference: ${dietaryPreference || 'any'}
- Servings count: ${servings}

Return ONLY valid JSON matching this exact structure:
{
  "meals": {
    "breakfast": {
      "name": "string",
      "prepTime": "string",
      "timeOfDay": "8:00 AM",
      "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number },
      "ingredients": [{ "name": "string", "quantity": "string", "category": "spice|vegetable|dairy|grain" }],
      "steps": ["string"]
    },
    "lunch": {
      "name": "string",
      "prepTime": "string",
      "timeOfDay": "1:00 PM",
      "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number },
      "ingredients": [{ "name": "string", "quantity": "string", "category": "spice|vegetable|dairy|grain" }],
      "steps": ["string"]
    },
    "dinner": {
      "name": "string",
      "prepTime": "string",
      "timeOfDay": "8:00 PM",
      "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number },
      "ingredients": [{ "name": "string", "quantity": "string", "category": "spice|vegetable|dairy|grain" }],
      "steps": ["string"]
    }
  },
  "groceryList": [
    { "item": "string", "quantity": "string", "estimatedCost": number }
  ],
  "substitutions": [
    { "original": "string", "substitute": "string", "reason": "string" }
  ],
  "budget": {
    "totalEstimated": number,
    "currency": "INR",
    "feasibility": "thrifty|balanced|premium",
    "tips": ["string"]
  }
}

Rules:
1. Feasibility tier of budget:
   - "thrifty": total Estimated Cost is under ₹300
   - "balanced": total Estimated Cost is ₹300–₹700
   - "premium": total Estimated Cost is over ₹700
2. Keep ingredients highly local to Indian markets (using INR prices, ₹, such as Paneer, Ghee, Spices, Roti).
3. Tailor the meals directly to their schedule workload: suggest zero-prep or light breakfasts if hectic, nourishing meals if active, cozy comfort foods if slow.
4. Each step in the preparation must be highly actionable, brief, and linear.
5. Provide helpful replacements for expensive or exotic ingredients inside 'substitutions'.
6. Return only valid JSON. Category for ingredients must be exactly one of: spice, vegetable, dairy, or grain.
`;

      let responseText = "";
      let engineName = "";
      const groqApiKey = process.env.GROQ_API_KEY;

      if (groqApiKey && groqApiKey !== "MY_GROQ_API_KEY" && groqApiKey.trim() !== "") {
        try {
          console.log("Routing meal plan curation via Groq API (Llama 3.3).");
          const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
          
          const requestBody = {
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: systemInstruction
              },
              {
                role: "user",
                content: promptMsg
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
          };

          const groqRes = await fetch(groqUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
          });

          if (!groqRes.ok) {
            const errText = await groqRes.text();
            throw new Error(`Groq returned error ${groqRes.status}: ${errText}`);
          }

          const data = await groqRes.json();
          responseText = data.choices?.[0]?.message?.content || "";
          engineName = "Groq Llama 3.3 70B";
        } catch (groqError: any) {
          console.error("Groq generation failed, attempting Gemini fallback...", groqError);
        }
      }

      // Fallback 1: Gemini API
      if (!responseText && ai) {
        try {
          console.log("Routing meal plan curation via Gemini fallback.");
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: promptMsg,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  meals: {
                    type: Type.OBJECT,
                    properties: {
                      breakfast: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          prepTime: { type: Type.STRING },
                          timeOfDay: { type: Type.STRING },
                          nutrition: {
                            type: Type.OBJECT,
                            properties: {
                              calories: { type: Type.NUMBER },
                              protein: { type: Type.NUMBER },
                              carbs: { type: Type.NUMBER },
                              fat: { type: Type.NUMBER }
                            },
                            required: ["calories", "protein", "carbs", "fat"]
                          },
                          ingredients: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING },
                                quantity: { type: Type.STRING },
                                category: { type: Type.STRING }
                              },
                              required: ["name", "quantity", "category"]
                            }
                          },
                          steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["name", "prepTime", "timeOfDay", "nutrition", "ingredients", "steps"]
                      },
                      lunch: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          prepTime: { type: Type.STRING },
                          timeOfDay: { type: Type.STRING },
                          nutrition: {
                            type: Type.OBJECT,
                            properties: {
                              calories: { type: Type.NUMBER },
                              protein: { type: Type.NUMBER },
                              carbs: { type: Type.NUMBER },
                              fat: { type: Type.NUMBER }
                            },
                            required: ["calories", "protein", "carbs", "fat"]
                          },
                          ingredients: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING },
                                quantity: { type: Type.STRING },
                                category: { type: Type.STRING }
                              },
                              required: ["name", "quantity", "category"]
                            }
                          },
                          steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["name", "prepTime", "timeOfDay", "nutrition", "ingredients", "steps"]
                      },
                      dinner: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          prepTime: { type: Type.STRING },
                          timeOfDay: { type: Type.STRING },
                          nutrition: {
                            type: Type.OBJECT,
                            properties: {
                              calories: { type: Type.NUMBER },
                              protein: { type: Type.NUMBER },
                              carbs: { type: Type.NUMBER },
                              fat: { type: Type.NUMBER }
                            },
                            required: ["calories", "protein", "carbs", "fat"]
                          },
                          ingredients: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING },
                                quantity: { type: Type.STRING },
                                category: { type: Type.STRING }
                              },
                              required: ["name", "quantity", "category"]
                            }
                          },
                          steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["name", "prepTime", "timeOfDay", "nutrition", "ingredients", "steps"]
                      }
                    },
                    required: ["breakfast", "lunch", "dinner"]
                  },
                  groceryList: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        item: { type: Type.STRING },
                        quantity: { type: Type.STRING },
                        estimatedCost: { type: Type.NUMBER }
                      },
                      required: ["item", "quantity", "estimatedCost"]
                    }
                  },
                  substitutions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        original: { type: Type.STRING },
                        substitute: { type: Type.STRING },
                        reason: { type: Type.STRING }
                      },
                      required: ["original", "substitute", "reason"]
                    }
                  },
                  budget: {
                    type: Type.OBJECT,
                    properties: {
                      totalEstimated: { type: Type.NUMBER },
                      currency: { type: Type.STRING },
                      feasibility: { type: Type.STRING },
                      tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["totalEstimated", "currency", "feasibility", "tips"]
                  }
                },
                required: ["meals", "groceryList", "substitutions", "budget"]
              }
            }
          });

          responseText = response.text || "";
          engineName = "Gemini 3.5 Flash";
        } catch (geminiError) {
          console.error("Gemini fallback failed.", geminiError);
        }
      }

      // Fallback 2: Local Rule-based engine if keys are missing
      if (!responseText) {
        console.log("No API keys or engines succeeded. Using highly customized Local Rule-based Curation.");
        engineName = "Local Indian Ledger Engine";
        
        const isNonVeg = dietaryPreference.toLowerCase().includes("non");
        const isVegan = dietaryPreference.toLowerCase().includes("vegan");
        
        let breakfastName = "Handcrafted Besan Chilla with Mint Chutney";
        let breakfastIngredients = [
          { name: "Besan (Gram Flour)", quantity: "150g", category: "grain" },
          { name: "Onions", quantity: "1 unit", category: "vegetable" },
          { name: "Green Chilies & Ginger", quantity: "20g", category: "spice" },
          { name: "Cardamom and Cumin seeds", quantity: "10g", category: "spice" }
        ];
        let breakfastNutrition = { calories: 280, protein: 12, carbs: 42, fat: 6 };
        let breakfastSteps = [
          "Whisk besan (gram flour) with water, salt, chopped green chilies, onions and cumin to form a smooth pouring batter.",
          "Smear a seasoned iron tawa with drops of oil over high flame.",
          "Pour a ladle of batter, spreading in outwards spirals to cook into a golden, thin crepe.",
          "Serve steaming hot with homemade refreshing mint and coriander green chutney."
        ];

        let lunchName = "Aromatic Paneer Masala with Tawa Rotis";
        let lunchIngredients = [
          { name: "Fresh Paneer (Cottage Cheese)", quantity: "200g", category: "dairy" },
          { name: "Tomatoes", quantity: "2 units", category: "vegetable" },
          { name: "Onions & Garlic", quantity: "150g", category: "vegetable" },
          { name: "Kashmiri Lal Mirch", quantity: "10g", category: "spice" },
          { name: "Whole Wheat Atta", quantity: "200g", category: "grain" }
        ];
        let lunchNutrition = { calories: 480, protein: 18, carbs: 54, fat: 16 };
        let lunchSteps = [
          "Sauté chopped onions, ginger, garlic, and ripe tomatoes in a pan with standard masalas until pulpy and aromatic.",
          "Purée the masala base, then cook paneer cubes in the rich, fragrant tandoor red gravy.",
          "Knead whole wheat dough and roll into thin rotis, roasting on a gas flame until puffed.",
          "Garnish with a sprinkle of roasted Kasoori Methi and serve alongside the hot parotas/rotis."
        ];

        let dinnerName = "Slow-Cooked One-Pot Dal Khichdi & Jeera Tadka";
        let dinnerIngredients = [
          { name: "Yellow Moong Dal", quantity: "100g", category: "grain" },
          { name: "Basmati Rice", quantity: "100g", category: "grain" },
          { name: "Desi Ghee", quantity: "30ml", category: "dairy" },
          { name: "Cumin Seeds", quantity: "15g", category: "spice" },
          { name: "Spinach / Seasonal Greens", quantity: "100g", category: "vegetable" }
        ];
        let dinnerNutrition = { calories: 410, protein: 14, carbs: 62, fat: 9 };
        let dinnerSteps = [
          "Wash yellow moong lentils and basmati rice, soaking them together in cool water for 15 minutes.",
          "Simmer in a pressure pot with water, turmeric gold powder, sea salt, and a handful of seasonal baby greens until beautifully soft.",
          "In a small ladle, heat 2 tablespoons of desi ghee until smoking, cracking cumin seeds and a pinched dry red chili.",
          "Pour the crackling, smokey tadka directly over the cooked khichdi and lid tightly for a minute. Serve hot."
        ];

        // Customize slightly based on inputs
        if (isNonVeg) {
          breakfastName = "Spiced Masala Egg Bhurji & Pav";
          breakfastIngredients = [
            { name: "Fresh Country Eggs", quantity: "2 units", category: "dairy" },
            { name: "Butter Pav (Soft Rolls)", quantity: "2 units", category: "grain" },
            { name: "Onions & Tomatoes", quantity: "100g", category: "vegetable" },
            { name: "Garam Masala", quantity: "5g", category: "spice" }
          ];
          breakfastNutrition = { calories: 340, protein: 16, carbs: 32, fat: 12 };
          breakfastSteps = [
            "Whisk eggs with double pinches of salt, crushed black pepper, and fine coriander.",
            "Sauté chopped red onions, tomatoes, and slitted green chilies in butter.",
            "Pour eggs, scrambling softly over medium heat. Toast pav buns on the same pan with spice residues."
          ];

          lunchName = "Homestyle Indian Chicken Curry & Steamed Rice";
          lunchIngredients = [
            { name: "Tender Farm Chicken", quantity: "250g", category: "grain" },
            { name: "Basmati Rice", quantity: "150g", category: "grain" },
            { name: "Ginger-Garlic Paste", quantity: "20g", category: "spice" },
            { name: "Indian Curry Powder", quantity: "15g", category: "spice" },
            { name: "Mustard Oil", quantity: "20ml", category: "spice" }
          ];
          lunchNutrition = { calories: 590, protein: 29, carbs: 68, fat: 14 };
          lunchSteps = [
            "Marinate chicken slices with lemon juice, turmeric, and freshly ground ginger-garlic.",
            "Sear spices in hot mustard oil, fry thick onions, then cover and cook the marinated chicken until fork-tender.",
            "Meanwhile, boil fluffy Basmati rice with single green cardamoms for maximum aroma."
          ];
        } else if (isVegan) {
          lunchName = "Smokey Tofu Bhurji Wrap";
          lunchIngredients = [
            { name: "Soya Organic Tofu", quantity: "200g", category: "grain" },
            { name: "Bell Peppers", quantity: "100g", category: "vegetable" },
            { name: "Turmeric & Chaat Masala", quantity: "10g", category: "spice" },
            { name: "Whole Wheat Roti/Wrap", quantity: "2 units", category: "grain" }
          ];
          lunchNutrition = { calories: 420, protein: 18, carbs: 49, fat: 9 };
          lunchSteps = [
            "Crumble fresh organic tofu manually, tossing with turmeric, salt, and generous chaat masala.",
            "Pan-fry thinly sliced capsicums, red onions, and sweet bell peppers.",
            "Assemble the items wrapped tightly inside roasted flatbread wraps."
          ];
        }

        const localPlan = {
          meals: {
            breakfast: {
              name: breakfastName,
              prepTime: "10 mins",
              timeOfDay: "8:00 AM",
              nutrition: breakfastNutrition,
              ingredients: breakfastIngredients,
              steps: breakfastSteps
            },
            lunch: {
              name: lunchName,
              prepTime: "20 mins",
              timeOfDay: "1:00 PM",
              nutrition: lunchNutrition,
              ingredients: lunchIngredients,
              steps: lunchSteps
            },
            dinner: {
              name: dinnerName,
              prepTime: "15 mins",
              timeOfDay: "8:00 PM",
              nutrition: dinnerNutrition,
              ingredients: dinnerIngredients,
              steps: dinnerSteps
            }
          },
          groceryList: [
            { item: "Besan / Whole Atta Flour", quantity: "350g", estimatedCost: 45 },
            { item: "Onions & Fresh Tomatoes", quantity: "400g", estimatedCost: 35 },
            { item: "Fresh Cottage Cheese (Paneer) or Tofu", quantity: "200g", estimatedCost: 110 },
            { item: "Basmati Rice & Moong Dal", quantity: "250g", estimatedCost: 30 },
            { item: "Pure Cow Ghee / Oil Pack", quantity: "100ml", estimatedCost: 90 },
            { item: "Fresh Coriander, Chili & Curry Spices", quantity: "1 bunch", estimatedCost: 20 }
          ],
          substitutions: [
            { original: "Pure Cow Ghee", substitute: "Refined cold-pressed coconut oil", reason: "Saves ₹60 and aligns perfectly with vegan diets" },
            { original: "Fresh Cottage Cheese (Paneer)", substitute: "Pressed extra firm organic soya tofu", reason: "A lower cost dairy-free alternative" }
          ],
          budget: {
            totalEstimated: 330,
            currency: "INR",
            feasibility: "balanced",
            tips: [
              "Chop ginger and chilies together in the morning to make a master flavoring paste for lunch and dinner.",
              "Store coriander sprigs in cool paper napkins to prevent rapid dampening.",
              "Prepare chilla batter 5 minutes beforehand to let the besan hydrate, yielding extra soft savory crepes."
            ]
          }
        };

        responseText = JSON.stringify(localPlan);
      }

      if (!responseText) {
        throw new Error("Failed to produce meal plan in all system layers.");
      }

      // Safe parse
      let mealPlan = JSON.parse(responseText.trim());
      
      // Clean schema or normalise case just in case of Llama discrepancies
      if (mealPlan.mealPlan) {
        mealPlan = mealPlan.mealPlan;
      }

      // Respond back with a unified envelope including the engine
      res.json({
        mealPlan,
        engine: engineName
      });

    } catch (error: any) {
      console.error("Meal plan generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate meal plan." });
    }
  });

  // Serve static assets or use Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
