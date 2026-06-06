import React, { useState } from "react";
import { UserPreferences, MealPlanResponse } from "./types";
import PlanForm from "./components/PlanForm";
import BudgetOverview from "./components/BudgetOverview";
import GroceryTracker from "./components/GroceryTracker";
import ThaliDial from "./components/ThaliDial";
import { 
  Flame, 
  Calendar, 
  Copy, 
  RefreshCw, 
  Info, 
  AlertCircle 
} from "lucide-react";

// Conforming default plan to matching Type definition (categorized ingredients)
const DEFAULT_PLAN: MealPlanResponse = {
  meals: {
    breakfast: {
      name: "Spiced Mango Overnight Oats",
      prepTime: "5 mins",
      timeOfDay: "8:00 AM",
      ingredients: [
        { name: "Rolled Oats", quantity: "150g", category: "grain" },
        { name: "Almond Milk", quantity: "250ml", category: "dairy" },
        { name: "Cardamom Powder", quantity: "5g", category: "spice" },
        { name: "Fresh Ripe Mangoes", quantity: "2 units", category: "vegetable" }
      ],
      steps: [
        "Combine rolled oats and almond milk in a clean, dry jar.",
        "Stir in sweet honey and a pinch of aromatic cardamom turmeric.",
        "Top with ripe fresh sliced mango chunks and leave to cold-set in fridge."
      ],
      nutrition: {
        calories: 320,
        protein: 8,
        carbs: 58,
        fat: 5
      }
    },
    lunch: {
      name: "Smoky Paneer Kathi Wrap",
      prepTime: "15 mins",
      timeOfDay: "1:00 PM",
      ingredients: [
        { name: "Fresh Paneer", quantity: "200g", category: "dairy" },
        { name: "Red Onions", quantity: "1 large", category: "vegetable" },
        { name: "Chaat Masala & Spices", quantity: "10g", category: "spice" },
        { name: "Whole Wheat Flatbread", quantity: "2 units", category: "grain" },
        { name: "Lemons", quantity: "1 unit", category: "vegetable" }
      ],
      steps: [
        "Pan-sear cottage cheese (paneer) cubes, then toss with hot chaat masala.",
        "Quick-pickle thin red onion rings with fresh lemon juice and sea salt.",
        "Toast flatbread tawa wraps over medium heat, layer together, and roll tightly."
      ],
      nutrition: {
        calories: 450,
        protein: 18,
        carbs: 48,
        fat: 12
      }
    },
    dinner: {
      name: "One-Pot Dal Tadka & Jeera Rice",
      prepTime: "25 mins",
      timeOfDay: "8:00 PM",
      ingredients: [
        { name: "Arhar Yellow Lentils", quantity: "250g", category: "grain" },
        { name: "fragrant Basmati Rice", quantity: "200g", category: "grain" },
        { name: "Pure Cow Ghee", quantity: "25ml", category: "dairy" },
        { name: "Cumin Seeds", quantity: "12g", category: "spice" },
        { name: "Dried Red Chilies", quantity: "2 units", category: "spice" },
        { name: "Fresh Green Coriander", quantity: "1 bunch", category: "vegetable" }
      ],
      steps: [
        "Rinse and cook lentils with a gold turmeric pinch in pressure pan.",
        "Steam rice with crackled cumin seeds and a hint of salt until fluffy.",
        "Sauté golden cumin seeds and dried red chili in pure ghee tadka.",
        "Combine cooked lentils and tadka, swirling fresh coriander on top."
      ],
      nutrition: {
        calories: 510,
        protein: 16,
        carbs: 70,
        fat: 8
      }
    }
  },
  groceryList: [
    { item: "Rolled Oats Flour", quantity: "250g", estimatedCost: 65 },
    { item: "Fresh Cottage Cheese (Paneer)", quantity: "200g", estimatedCost: 110 },
    { item: "Arhar Yellow Lentils", quantity: "500g", estimatedCost: 85 },
    { item: "Sweet Local Mangoes", quantity: "2 units", estimatedCost: 120 },
    { item: "Basmati Rice Packet", quantity: "1kg", estimatedCost: 75 }
  ],
  substitutions: [
    { original: "Fresh Mangoes", substitute: "Frozen pulp or sweet banana slices", reason: "Saves ₹80 during offseason" },
    { original: "Almond Milk", substitute: "Warm standard dairy or coconut milk", reason: "A more cost-effective alternative" }
  ],
  budget: {
    totalEstimated: 455,
    currency: "INR",
    feasibility: "balanced",
    tips: [
      "Prep overnight oats before sleep to save morning cooking focus.",
      "Sauté paneer gently; keeping it moist keeps the kathi wrap tender.",
      "Cook dual rice batches to set aside leftovers for stir-fry lunch next day."
    ]
  }
};

export default function App() {
  const [mealPlan, setMealPlan] = useState<MealPlanResponse>(DEFAULT_PLAN);
  const [engineTag, setEngineTag] = useState<string>("Local Indian Ledger Engine");
  
  const [lastPrefs, setLastPrefs] = useState<UserPreferences>({
    dayDescription: "Busy corporate calls from 9 AM to 7 PM. Extremely low energy by evening. Need a zero-cook quick breakfast, single-pot lunch, and cozy comforting North Indian dinner like Dal Khichdi.",
    budgetPreference: "medium",
    dietaryPreference: "Vegetarian",
    servings: 2,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive checklist states for checking off active recipes
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleToggleStep = (mealKey: string, stepIdx: number) => {
    const key = `${mealKey}-${stepIdx}`;
    setCheckedSteps((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleGeneratePlan = async (prefs: UserPreferences & { energyLevel?: string; allergies?: string }) => {
    setIsLoading(true);
    setError(null);
    setLastPrefs(prefs);
    setCheckedSteps({}); // clear checker history on recreate

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs)
      });

      if (!response.ok) {
        throw new Error("Server encountered an error while curating your customized kitchen plan.");
      }

      const data = await response.json();
      
      // Response contains { mealPlan, engine }
      if (data.mealPlan) {
        setMealPlan(data.mealPlan);
        setEngineTag(data.engine || "Secure Dual-Core Router");
      } else {
        setMealPlan(data);
        setEngineTag("Dual-Core Processor API");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish server connection. Loading offline ledger data.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Clipboard shopping export action
  const handleExportPlanToClipboard = () => {
    const header = `=== MY INDIAN KITCHEN PLAN ===\n`;
    const mealsText = `BREAKFAST: ${mealPlan.meals.breakfast.name}\nLUNCH: ${mealPlan.meals.lunch.name}\nDINNER: ${mealPlan.meals.dinner.name}\n\n`;
    
    const groceryHeader = `=== GROCERY LIST ===\n`;
    const groceries = mealPlan.groceryList
      .map((item) => `• [ ] ${item.item} (${item.quantity}) — ₹${item.estimatedCost}`)
      .join("\n");
      
    const subsHeader = `\n\n=== SUBSTITUTIONS ===\n`;
    const substitutions = mealPlan.substitutions
      .map((sub) => `• ${sub.original} → ${sub.substitute}: ${sub.reason}`)
      .join("\n");
      
    const budgetFooter = `\n\nBUDGET CATEGORY: ${mealPlan.budget.feasibility.toUpperCase()}\nTOTAL EXPECTED OUTLAY: ${mealPlan.budget.currency} ₹${mealPlan.budget.totalEstimated}\nTIPS: ${mealPlan.budget.tips.join("\n")}\n\nGenerated by The Efficient Day Plan Ledger`;

    const blobCombined = `${header}${mealsText}${groceryHeader}${groceries}${subsHeader}${substitutions}${budgetFooter}`;
    
    navigator.clipboard.writeText(blobCombined);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
    }, 2000);
  };

  // Helper calculating progress parameters (flame status tracker) for meals
  const getMealTrackerStats = (mealKey: "breakfast" | "lunch" | "dinner") => {
    const steps = mealPlan.meals[mealKey].steps;
    if (!steps.length) return 0;
    let checkedCount = 0;
    steps.forEach((_, idx) => {
      if (checkedSteps[`${mealKey}-${idx}`]) {
        checkedCount++;
      }
    });
    return Math.round((checkedCount / steps.length) * 100);
  };

  // Helper mapping ingredient categories to small aesthetic pouch indicators
  const getCategoryTheme = (category: string) => {
    switch (category.toLowerCase()) {
      case "spice":
        return { color: "bg-[#E9A84C]", text: "Spices" };
      case "vegetable":
        return { color: "bg-[#2D6A4F]", text: "Veggie" };
      case "dairy":
        return { color: "bg-[#378ADD]", text: "Dairy" };
      case "grain":
      default:
        return { color: "bg-[#C84B2F]", text: "Grain" };
    }
  };

  // Sum total nutrition values to show in master header dashboard
  const getTotalNutrition = () => {
    const meals = [mealPlan.meals.breakfast, mealPlan.meals.lunch, mealPlan.meals.dinner];
    return meals.reduce(
      (acc, m) => {
        acc.calories += m.nutrition?.calories || 0;
        acc.protein += m.nutrition?.protein || 0;
        acc.carbs += m.nutrition?.carbs || 0;
        acc.fat += m.nutrition?.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totalNutrition = getTotalNutrition();

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1412] font-sans antialiased pb-20 selection:bg-[#E8E0D0] selection:text-black">
      
      {/* 1. SPICE TICKER HEADER (continuous scrolling market quote) */}
      <div className="w-full bg-[#1C1412] text-[#E9A84C] py-2 overflow-hidden border-b border-[#E8E0D0] font-mono text-xs select-none">
        <div className="whitespace-nowrap flex">
          <div className="animate-ticker shrink-0 select-none">
            <span>Dal Tadka ₹120/kg · Fresh Paneer ₹80/250g · Mandi Tomatoes ₹45/kg · Pure Cow Ghee ₹580/500g · Basmati Rice ₹65/kg · Small Onions ₹30/kg · Ginger Root ₹80/250g · Cold Pressed Mustard Oil ₹160/L · Fresh Coriander Bunches ₹15/unit · Kashmiri Red Chili ₹320/kg · Dal Tadka ₹120/kg · Fresh Paneer ₹80/250g · Mandi Tomatoes ₹45/kg · Pure Cow Ghee ₹580/500g · Basmati Rice ₹65/kg · Small Onions ₹30/kg · Ginger Root ₹80/250g · Cold Pressed Mustard Oil ₹160/L · Fresh Coriander Bunches ₹15/unit · Kashmiri Red Chili ₹320/kg</span>
          </div>
          <div className="animate-ticker shrink-0 select-none" aria-hidden="true">
            <span>Dal Tadka ₹120/kg · Fresh Paneer ₹80/250g · Mandi Tomatoes ₹45/kg · Pure Cow Ghee ₹580/500g · Basmati Rice ₹65/kg · Small Onions ₹30/kg · Ginger Root ₹80/250g · Cold Pressed Mustard Oil ₹160/L · Fresh Coriander Bunches ₹15/unit · Kashmiri Red Chili ₹320/kg · Dal Tadka ₹120/kg · Fresh Paneer ₹80/250g · Mandi Tomatoes ₹45/kg · Pure Cow Ghee ₹580/500g · Basmati Rice ₹65/kg · Small Onions ₹30/kg · Ginger Root ₹80/250g · Cold Pressed Mustard Oil ₹160/L · Fresh Coriander Bunches ₹15/unit · Kashmiri Red Chili ₹320/kg</span>
          </div>
        </div>
      </div>

      {/* Connection Issue Toast Banner */}
      {error && (
        <div className="bg-[#FDF0ED] border-b border-[#C84B2F]/30 py-3 px-6 text-center text-xs font-semibold text-[#7F1D1D] tracking-tight transition-all flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#C84B2F]" />
          <span>Notice: {error}</span>
        </div>
      )}

      {/* Main Container Core */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-6 space-y-8">
        
        {/* Dynamic Header Frame */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#E8E0D0] pb-6 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C84B2F] flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse" />
              Spice merchant catalog • {formattedDate}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-[#1C1412] tracking-tight">
              The Efficient Day Plan
            </h1>
            <p className="text-xs text-[#7A6C5D] font-sans">
              Handwritten Market Ledger meets modern Indian Spice Inventory tracking
            </p>
          </div>

          <div className="text-left md:text-right space-y-1 shrink-0">
            {/* Dynamic engine badge track */}
            <div className="flex items-center md:justify-end gap-2 text-[10px] font-mono text-[#7A6C5D] bg-white border border-[#E8E0D0] px-3 py-1.5 rounded-lg shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse" />
              <span>{engineTag}</span>
            </div>
          </div>
        </header>

        {/* TRACK 2: Intake setup splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <PlanForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-5">
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-[#E8E0D0] p-12 flex flex-col items-center justify-center text-center space-y-5 h-[390px] md:h-[432px]">
                {/* TRACK 10 LOADING JARS */}
                <div className="flex items-end justify-center gap-4 h-16">
                  <div className="w-4 h-8 bg-[#C84B2F]/90 rounded-md border border-[#1C1412] animate-[bounce_0.6s_infinite_100ms] flex flex-col items-center justify-start pt-1.5">
                    <div className="w-2.5 h-1.5 bg-[#E8E0D0] rounded-sm" />
                  </div>
                  <div className="w-4 h-10 bg-[#E9A84C]/90 rounded-md border border-[#1C1412] animate-[bounce_0.6s_infinite_200ms] flex flex-col items-center justify-start pt-1.5">
                    <div className="w-2.5 h-1.5 bg-[#E8E0D0] rounded-sm" />
                  </div>
                  <div className="w-4 h-12 bg-[#2D6A4F]/90 rounded-md border border-[#1C1412] animate-[bounce_0.6s_infinite_300ms] flex flex-col items-center justify-start pt-1.5">
                    <div className="w-2.5 h-1.5 bg-[#E8E0D0] rounded-sm" />
                  </div>
                </div>
                <div>
                  <h4 className="font-serif italic text-lg text-[#1C1412]">Your spice plan is being curated...</h4>
                  <p className="text-xs text-[#7A6C5D] mt-2 max-w-[280px] mx-auto font-sans leading-relaxed">
                    Preparing ingredient substitution swap chits and matching costs to daily energy quotas.
                  </p>
                </div>
              </div>
            ) : (
              <BudgetOverview budget={mealPlan.budget} />
            )}
          </div>
        </div>

        {/* Section Divider Block */}
        <div className="flex items-center gap-4 py-2 select-none">
          <div className="h-[1px] bg-[#E8E0D0] flex-1" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#7A6C5D] bg-[#FAF7F2] border border-[#E8E0D0] px-4.5 py-1.5 rounded-full shrink-0">
            KITCHEN TIMELINE SCHEDULE
          </span>
          <div className="h-[1px] bg-[#E8E0D0] flex-1" />
        </div>

        {/* Core Schedule Dashboard Display */}
        {isLoading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center p-12 text-center text-[#7A6C5D] bg-white border border-[#E8E0D0] rounded-2xl">
            <RefreshCw className="w-8 h-8 text-[#C84B2F] animate-spin mb-3" />
            <p className="font-serif italic text-sm">Structuring recipes and sourcing guidelines...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: 1. Main Totals Row, then 2. The Three Meal Cards */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* CUMULATIVE NUTRITION TOTALS */}
              <div className="p-4 bg-white border border-[#E8E0D0] rounded-xl flex flex-wrap justify-between items-center gap-3 shadow-2xs select-none">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#7A6C5D] shrink-0 font-mono">
                  Cumulative Daily Outlay Quotas:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-[#FAF7F2] border border-[#E8E0D0] px-2.5 py-1 rounded">
                    ⚡ Total Energy: <strong className="text-[#C84B2F]">{totalNutrition.calories} kcal</strong>
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-[#FAF7F2] border border-[#E8E0D0] px-2.5 py-1 rounded">
                    🍗 Proteins: <strong className="text-[#2D6A4F]">{totalNutrition.protein}g</strong>
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-[#FAF7F2] border border-[#E8E0D0] px-2.5 py-1 rounded">
                    🌾 Carbs: <strong className="text-[#E9A84C]">{totalNutrition.carbs}g</strong>
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-[#FAF7F2] border border-[#E8E0D0] px-2.5 py-1 rounded">
                    🧈 Fats: <strong className="text-[#7A6C5D]">{totalNutrition.fat}g</strong>
                  </span>
                </div>
              </div>

              {/* THREE CONCRETE MEAL ROSTER FILES */}
              <div className="flex flex-col gap-6">
                
                {/* Meal Card Generator Loop */}
                {(["breakfast", "lunch", "dinner"] as const).map((mealKey, index) => {
                  const meal = mealPlan.meals[mealKey];
                  const progressPct = getMealTrackerStats(mealKey);
                  const isCompleted = progressPct === 100;
                  
                  // Label ordering counts
                  const orderNum = `0${index + 1}`;
                  
                  return (
                    <div 
                      key={mealKey}
                      className="bg-white rounded-2xl border border-[#E8E0D0] shadow-sm flex flex-col md:flex-row overflow-hidden relative group hover:border-[#C84B2F]/40 transition-all duration-300"
                    >
                      {/* Left Side: Rotated Time Stamp stamp look */}
                      <div className="md:w-[65px] bg-[#FAF7F2] border-r border-b md:border-b-0 border-[#E8E0D0] shrink-0 flex md:flex-col items-center justify-between md:justify-center p-3 select-none">
                        <span className="text-[10px] font-mono font-bold text-[#7A6C5D]/90 uppercase md:mb-6">
                          {orderNum}
                        </span>
                        
                        {/* 90-degree rotated labels */}
                        <div className="md:rotate-180 md:[writing-mode:vertical-lr] text-center font-serif font-bold italic text-sm text-[#C84B2F] tracking-tight">
                          {meal.timeOfDay || (mealKey === "breakfast" ? "8:00 AM" : mealKey === "lunch" ? "1:00 PM" : "8:00 PM")}
                        </div>
                        
                        <span className="hidden md:block h-6 w-[11px]" />
                      </div>

                      {/* Right Content Sheet */}
                      <div className="flex-1 p-5 md:p-6 space-y-5">
                        
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          {/* Heading */}
                          <div className="space-y-1">
                            <h3 className="text-2xl font-serif text-[#1C1412] leading-tight flex items-baseline gap-2">
                              {meal.name}
                            </h3>
                            <div className="text-[10px] font-mono text-[#7A6C5D] flex items-center gap-1">
                              <span>Standard Prep: <strong>{meal.prepTime}</strong></span>
                              <span>•</span>
                              <span className="capitalize">{lastPrefs.dietaryPreference} Preference</span>
                            </div>
                          </div>

                          {/* Interactive Flame intensity tracker progress status */}
                          <div className="h-8 py-1.5 px-3 rounded-lg bg-[#FAF7F2] border border-[#E8E0D0] flex items-center gap-2 font-mono text-[10px] text-[#7A6C5D] shrink-0">
                            <span>Steps Done:</span>
                            <div className="flex items-center gap-0.5">
                              {/* Glowing flame graphic based on steps completion */}
                              <Flame className={`w-4 h-4 transition-all duration-300 ${progressPct > 0 ? "text-[#C84B2F] fill-[#C84B2F]" : "text-[#7A6C5D]/30"}`} />
                              <span className="font-bold text-[#1C1412]">{progressPct}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Splitting Section: Ingredients tags & Thali Dial details */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-b border-dashed border-[#E8E0D0] py-4 select-none">
                          
                          {/* 5 Column Thali nutrition graphic dial */}
                          <div className="md:col-span-5 flex justify-center md:justify-start items-center">
                            <ThaliDial nutrition={meal.nutrition} title={mealKey} size={115} />
                          </div>

                          {/* 7 Column Ingredient Spice Pouch list */}
                          <div className="md:col-span-7 space-y-2 text-left">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D] block">
                              PANTRY POUCH INGREDIENTS
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {meal.ingredients.map((ing, i) => {
                                const details = getCategoryTheme(ing.category || "spice");
                                return (
                                  <div 
                                    key={i}
                                    className="flex items-center gap-1.5 bg-[#F5EFE6] border border-[#D4C5B0] px-2.5 py-1 rounded-full text-[11px] text-[#1C1412] font-serif italic shadow-2xs"
                                    title={`Category: ${details.text}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${details.color}`} />
                                    <span>{ing.name} <strong className="font-sans font-normal text-[9px] text-[#7A6C5D] uppercase">({ing.quantity})</strong></span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* Interactive Steps Checklist (CHALKBOARD LAYOUT WITH Left block theme) */}
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D] block">
                            LINEAR PREPARATION CHECKLIST
                          </span>
                          
                          <div className="flex flex-col gap-2.5 text-xs text-left">
                            {meal.steps.map((step, stepIdx) => {
                              const stepKey = `${mealKey}-${stepIdx}`;
                              const isChecked = !!checkedSteps[stepKey];
                              return (
                                <div
                                  key={stepIdx}
                                  onClick={() => handleToggleStep(mealKey, stepIdx)}
                                  className={`rounded-lg p-3 border-l-4 transition-all duration-300 flex items-start gap-3 cursor-pointer group shadow-2xs ${
                                    isChecked 
                                      ? "bg-[#FAF7F2]/40 border-[#E8E0D0] opacity-[0.45]" 
                                      : "bg-[#FAF7F2]/80 border-[#C84B2F] hover:bg-white"
                                  }`}
                                >
                                  {/* Custom circle hand-drawn check-box */}
                                  <button 
                                    type="button" 
                                    className="pt-0.5 shrink-0 transition-transform active:scale-95"
                                    aria-label={isChecked ? "Mark step uncompleted" : "Mark step completed"}
                                  >
                                    <svg 
                                      width="16" 
                                      height="16" 
                                      viewBox="0 0 20 20" 
                                      fill="none" 
                                      className="stroke-[#1C1412] hover:stroke-[#C84B2F]"
                                    >
                                      {/* Sketch style circle outline */}
                                      <circle cx="10" cy="10" r="8" strokeWidth="2" strokeDasharray="3" />
                                      {isChecked && (
                                        <path 
                                          d="M6 10l3 3 5-6" 
                                          stroke="#2D6A4F" 
                                          strokeWidth="2.5" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                        />
                                      )}
                                    </svg>
                                  </button>
                                  
                                  {/* Step text content */}
                                  <p className={`font-serif italic leading-relaxed text-[#1C1412] select-none ${isChecked ? "line-through text-[#7A6C5D] not-italic" : "text-[#1C1412] group-hover:text-black"}`}>
                                    {step}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Informational helpful panel */}
              <div className="p-4 bg-white border border-[#E8E0D0] rounded-xl flex gap-3 text-left">
                <Info className="w-5 h-5 text-[#C84B2F] shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-xs font-serif italic text-[#7A6C5D]">
                    "Check off local steps on compliance. Meal quantities inside the Kirana bill have been balanced cleanly so you buy only what your busy routine requires for {lastPrefs.servings} people."
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic Sidebar Receipts */}
            <div className="lg:col-span-4 sticky top-6">
              <GroceryTracker 
                groceryList={mealPlan.groceryList}
                substitutions={mealPlan.substitutions}
                feasibility={mealPlan.budget.feasibility}
              />
            </div>

          </div>
        )}

      </div>

      {/* TRACK 6: FLOATING LIST CONVERT PAPER CHIT BUTTON */}
      {mealPlan.groceryList?.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 select-none">
          <button
            onClick={handleExportPlanToClipboard}
            className="group flex items-center gap-2.5 bg-[#1C1412] border-2 border-[#E9A84C] text-white hover:bg-[#C84B2F] active:scale-[0.98] px-5 py-4.5 h-[52px] rounded-lg shadow-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer select-none pointer-events-auto"
            style={{ 
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              transform: "rotate(-1deg)"
            }}
          >
            <Copy className="w-4 h-4 text-[#E9A84C] group-hover:text-white" />
            <span>Copy Ledger chits</span>
          </button>
        </div>
      )}

      {/* Slide Up Clipboard copy confirmation toast */}
      <div 
        className={`fixed bottom-20 right-6 z-50 bg-[#2D6A4F] text-white px-5 py-3 rounded-lg shadow-lg text-xs font-mono select-none pointer-events-none transition-all duration-300 translate-y-0 ${
          copiedNotification 
            ? "translate-y-[-10px] opacity-100 scale-100" 
            : "translate-y-[50px] opacity-0 scale-95"
        }`}
      >
        ✓ Ledger records copied to clipboard!
      </div>

    </div>
  );
}
