export interface NutritionalInfo {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface IngredientItem {
  name: string;
  quantity: string;
  category: "spice" | "vegetable" | "dairy" | "grain";
}

export interface MealDetail {
  name: string;
  prepTime: string;
  timeOfDay: string;
  ingredients: IngredientItem[];
  steps: string[];
  nutrition: NutritionalInfo;
}

export interface MealsCollection {
  breakfast: MealDetail;
  lunch: MealDetail;
  dinner: MealDetail;
}

export interface GroceryItem {
  item: string;
  quantity: string;
  estimatedCost: number;
  checked?: boolean; // client-side tracking state
}

export interface Substitution {
  original: string;
  substitute: string;
  reason: string;
}

export interface BudgetDetail {
  totalEstimated: number;
  currency: string;
  feasibility: "thrifty" | "balanced" | "premium";
  tips: string[];
}

export interface MealPlanResponse {
  meals: MealsCollection;
  groceryList: GroceryItem[];
  substitutions: Substitution[];
  budget: BudgetDetail;
}

export interface UserPreferences {
  dayDescription: string;
  budgetPreference: "low" | "medium" | "high" | "any";
  dietaryPreference: string; // Vegetarian, Non-Vegetarian, Vegan, Gluten-Free, Any
  servings: number;
}
