import React, { useState } from "react";
import { UserPreferences } from "../types";
import { Sparkles, AlertCircle, Trash2 } from "lucide-react";

interface PlanFormProps {
  onSubmit: (prefs: UserPreferences & { energyLevel?: string; allergies?: string }) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    id: "busy",
    label: "👔 Busy Corporate Day",
    description: "Hectic morning calls, single-pot late night comfort.",
    prefs: {
      dayDescription: "Back-to-back corporate calls from 9 AM to 7 PM. Extremely low energy by evening. Need a zero-cook quick breakfast, light lunch, and a simple comforting single-pot dinner.",
      budgetPreference: "low" as const,
      dietaryPreference: "Vegetarian",
      servings: 2,
      energyLevel: "low",
      allergies: ""
    }
  },
  {
    id: "sunday",
    label: "🧘 Sunday Cooking Prep",
    description: "Relaxed morning feast with fresh regional greens.",
    prefs: {
      dayDescription: "Relaxing Sunday at home. Plenty of morning energy. I want to cook a healthy traditional South Indian lunch like Sambar, Rice, and Cabbage Poriyal.",
      budgetPreference: "medium" as const,
      dietaryPreference: "Vegetarian",
      servings: 4,
      energyLevel: "high",
      allergies: ""
    }
  },
  {
    id: "gym",
    label: "🏋️‍♂️ Strength Workout Day",
    description: "Sustaining proteins, extra tofu or paneer cottage cheese.",
    prefs: {
      dayDescription: "Heavy workout at 6 PM. Need a high-protein breakfast and post-workout muscle refuel dinner. Prefer high-nutrition cottage cheese, lentils, and quick recovery items.",
      budgetPreference: "medium" as const,
      dietaryPreference: "Vegetarian",
      servings: 2,
      energyLevel: "medium",
      allergies: ""
    }
  },
  {
    id: "monsoon",
    label: "🌧️ Cozy Shahi Monsoon",
    description: "Indulgent butter gravy or rich curry with high comfort.",
    prefs: {
      dayDescription: "Rainy day stuck indoors. Feeling like slow-cooked rich food, aromatic spices, and warm flavorful gravy like butter paneer or chicken korma.",
      budgetPreference: "high" as const,
      dietaryPreference: "Non-Vegetarian",
      servings: 2,
      energyLevel: "medium",
      allergies: ""
    }
  }
];

export default function PlanForm({ onSubmit, isLoading }: PlanFormProps) {
  const [dayDescription, setDayDescription] = useState("");
  const [budgetPreference, setBudgetPreference] = useState<UserPreferences["budgetPreference"]>("medium");
  const [dietaryPreference, setDietaryPreference] = useState("Vegetarian");
  const [servings, setServings] = useState(2);
  const [energyLevel, setEnergyLevel] = useState("medium");
  const [allergies, setAllergies] = useState("");
  const [error, setError] = useState("");

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setDayDescription(preset.prefs.dayDescription);
    setBudgetPreference(preset.prefs.budgetPreference);
    setDietaryPreference(preset.prefs.dietaryPreference);
    setServings(preset.prefs.servings);
    setEnergyLevel(preset.prefs.energyLevel);
    setAllergies(preset.prefs.allergies);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayDescription.trim()) {
      setError("Please describe your day's schedule or apply a preset below to instruct the kitchen.");
      return;
    }
    setError("");
    onSubmit({
      dayDescription,
      budgetPreference,
      dietaryPreference,
      servings,
      energyLevel,
      allergies
    });
  };

  const handleClear = () => {
    setDayDescription("");
    setBudgetPreference("medium");
    setDietaryPreference("Vegetarian");
    setEnergyLevel("medium");
    setAllergies("");
    setServings(2);
    setError("");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] shadow-sm p-6 md:p-8 space-y-6 text-[#1C1412]" id="ledger-intake-form">
      {/* Header and subtitle */}
      <div className="border-b border-dashed border-[#E8E0D0] pb-4">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C84B2F] mb-1 block">
          Ledger Entry Module
        </span>
        <h2 className="text-3xl font-serif text-[#1C1412] tracking-tight">
          Establish Today’s Routine
        </h2>
        <p className="text-sm font-sans text-[#7A6C5D] mt-1">
          Tell us your schedule, workload, or general mood. The assistant will calibrate the complexity and timing of your meals accordingly.
        </p>
      </div>

      {/* Preset Badges as Vintage Stamps */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#7A6C5D] mb-3">
          Quick Day Selection (Pre-written Records)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-3 rounded-lg border border-[#E8E0D0] bg-[#FAF7F2] hover:bg-[#FAF7F2]/50 hover:border-[#C84B2F] transition-all group cursor-pointer text-xs flex flex-col justify-between h-[85px]"
            >
              <div className="font-bold text-[#1C1412] font-serif group-hover:text-[#C84B2F]">
                {preset.label}
              </div>
              <div className="text-[10px] text-[#7A6C5D] leading-tight line-clamp-2 mt-1">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Structured Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Day description text-area */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="day-description" className="block text-[10px] uppercase tracking-wider font-bold text-[#1C1412]">
              Describe Your Day, Workload & Energy Flow
            </label>
            <div className="flex items-center gap-3">
              {dayDescription.trim() && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer font-mono"
                  title="Clear Inputs"
                >
                  <Trash2 className="w-3 h-3" /> Clear entries
                </button>
              )}
              <span className="text-[10px] text-[#7A6C5D] font-mono">
                {dayDescription.length} characters
              </span>
            </div>
          </div>
          
          <textarea
            id="day-description"
            rows={3}
            className="w-full text-xs rounded-lg border border-[#E8E0D0] p-3 focus:border-[#C84B2F] focus:ring-1 focus:ring-[#C84B2F] bg-[#FAF7F2]/45 text-[#1C1412] outline-none transition-all placeholder:text-[#a09384] font-serif italic leading-relaxed"
            placeholder="e.g., Working double shifts today. Absolute chaos from 10 AM to 5 PM with client calls. No time to cook in the afternoon, but would love a spicy homecooked paneer curry after work."
            value={dayDescription}
            onChange={(e) => {
              setDayDescription(e.target.value);
              setError("");
            }}
          />
          {error && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#FDF0ED] border border-[#FDA4AF] rounded-md text-red-800 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#C84B2F]" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Energy Level */}
          <div className="lg:col-span-1">
            <label htmlFor="energy-select" className="block text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D] mb-1.5">
              Energy Status
            </label>
            <select
              id="energy-select"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              className="w-full text-[11px] rounded-lg border border-[#E8E0D0] bg-white p-2 text-[#1C1412] focus:border-[#C84B2F] outline-none cursor-pointer transition-all font-sans font-medium"
            >
              <option value="low">🥱 Tired / Low</option>
              <option value="medium">😐 Medium</option>
              <option value="high">🔥 Active / High</option>
            </select>
          </div>

          {/* Diet Preference */}
          <div className="lg:col-span-1">
            <label htmlFor="diet-select" className="block text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D] mb-1.5">
              Kitchen Style
            </label>
            <select
              id="diet-select"
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              className="w-full text-[11px] rounded-lg border border-[#E8E0D0] bg-white p-2 text-[#1C1412] focus:border-[#C84B2F] outline-none cursor-pointer transition-all font-sans font-medium"
            >
              <option value="Vegetarian">🌱 Vegetarian</option>
              <option value="Vegan">🥦 Vegan Lifestyle</option>
              <option value="Non-Vegetarian">🍗 Non-Veg</option>
            </select>
          </div>

          {/* Budget Range (INR) */}
          <div className="lg:col-span-1">
            <label htmlFor="budget-select" className="block text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D] mb-1.5">
              Cap Limit
            </label>
            <select
              id="budget-select"
              value={budgetPreference}
              onChange={(e) => setBudgetPreference(e.target.value as any)}
              className="w-full text-[11px] rounded-lg border border-[#E8E0D0] bg-white p-2 text-[#1C1412] focus:border-[#C84B2F] outline-none cursor-pointer transition-all font-sans font-medium"
            >
              <option value="low">Thrifty (Under ₹300)</option>
              <option value="medium">Balanced (₹300-₹700)</option>
              <option value="high">Premium (Over ₹700)</option>
              <option value="any">Flexible (No Cap)</option>
            </select>
          </div>

          {/* Allergies and Exclusions */}
          <div className="lg:col-span-1">
            <label htmlFor="allergies-input" className="block text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D] mb-1.5">
              Omit/Allergies
            </label>
            <input
              id="allergies-input"
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g., Peanuts, mushroom"
              className="w-full text-[11px] rounded-lg border border-[#E8E0D0] bg-white p-2 text-[#1C1412] focus:border-[#C84B2F] outline-none placeholder:text-[#7A6C5D]/40 transition-all font-sans"
            />
          </div>

          {/* Servings counter */}
          <div className="lg:col-span-1">
            <label className="block text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D] mb-1.5">
              People Count
            </label>
            <div className="flex items-center border border-[#E8E0D0] rounded-lg bg-white overflow-hidden h-8">
              <button
                type="button"
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-8 h-full font-bold text-[#7A6C5D] hover:bg-[#FAF7F2] hover:text-[#C84B2F] transition-colors pointer cursor-pointer"
                aria-label="Decrease"
              >
                -
              </button>
              <span className="flex-1 text-center text-[11px] font-bold text-[#1C1412]">
                {servings}
              </span>
              <button
                type="button"
                onClick={() => setServings(Math.min(10, servings + 1))}
                className="w-8 h-full font-bold text-[#7A6C5D] hover:bg-[#FAF7F2] hover:text-[#C84B2F] transition-colors pointer cursor-pointer"
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Plan Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#C84B2F] hover:bg-[#A83824] disabled:bg-[#7A6C5D] text-white text-xs font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm font-sans"
          style={{ height: "48px" }}
        >
          <Sparkles className="w-4 h-4 text-[#E9A84C]" />
          <span>{isLoading ? "Consulting Spice Master..." : "Plan my kitchen day →"}</span>
        </button>
      </form>
    </div>
  );
}
