import React from "react";
import { NutritionalInfo } from "../types";

interface ThaliDialProps {
  nutrition: NutritionalInfo;
  title?: string;
  size?: number;
}

export default function ThaliDial({ nutrition, title, size = 110 }: ThaliDialProps) {
  const { calories = 0, protein = 0, carbs = 0, fat = 0 } = nutrition;

  // Max scale values to calculate fill percentages logically per meal
  const limitCalories = 800; // meal calories limit cap
  const limitProtein = 40;  // meal protein cap (grams)
  const limitCarbs = 100;   // meal carbs cap (grams)
  const limitFat = 30;      // meal fat cap (grams)

  const pctCal = Math.min((calories / limitCalories) * 100, 100);
  const pctProt = Math.min((protein / limitProtein) * 100, 100);
  const pctCarb = Math.min((carbs / limitCarbs) * 100, 100);
  const pctFat = Math.min((fat / limitFat) * 100, 100);

  // SVG parameters
  const strokeWidth = 5;
  const spacing = 7;
  
  // Concentric radii counts
  const rCal = 42;
  const rProt = rCal - strokeWidth - spacing; // 30
  const rCarb = rProt - strokeWidth - spacing; // 18
  const rFat = rCarb - strokeWidth - spacing; // 6 (dots or fill)

  // Circumference calculations
  const cCal = 2 * Math.PI * rCal;
  const cProt = 2 * Math.PI * rProt;
  const cCarb = 2 * Math.PI * rCarb;
  const cFat = 2 * Math.PI * rFat;

  // Offset calculations (dash stroke-offsets draw counter-clockwise from top)
  const offsetCal = cCal - (pctCal / 100) * cCal;
  const offsetProt = cProt - (pctProt / 100) * cProt;
  const offsetCarb = cCarb - (pctCarb / 100) * cCarb;
  const offsetFat = cFat - (pctFat / 100) * cFat;

  return (
    <div className="flex flex-col items-center justify-center space-y-1 bg-[#FAF7F2]/65 border border-[#E8E0D0] p-3.5 rounded-xl text-[10px] shadow-2xs font-sans relative">
      
      {/* Visual background thali brass color accent */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          className="transform -rotate-90 select-none animate-fadeIn"
        >
          {/* Main Plate Rim Outline (Ancient brass thali texture) */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="#E8E0D0" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="46.5" fill="none" stroke="#FAF7F2" strokeWidth="1" />

          {/* Underlay tracking rings */}
          <circle cx="50" cy="50" r={rCal} fill="none" stroke="#E8E0D0" strokeWidth={strokeWidth} opacity="0.3" />
          <circle cx="50" cy="50" r={rProt} fill="none" stroke="#E8E0D0" strokeWidth={strokeWidth} opacity="0.3" />
          <circle cx="50" cy="50" r={rCarb} fill="none" stroke="#E8E0D0" strokeWidth={strokeWidth} opacity="0.3" />

          {/* Calories Ring - Fresh Coriander Green (#2D6A4F) */}
          <circle 
            cx="50" 
            cy="50" 
            r={rCal} 
            fill="none" 
            stroke="#2D6A4F" 
            strokeWidth={strokeWidth} 
            strokeDasharray={cCal} 
            strokeDashoffset={offsetCal} 
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Protein Ring - Deep Tandoor Red (#C84B2F) */}
          <circle 
            cx="50" 
            cy="50" 
            r={rProt} 
            fill="none" 
            stroke="#C84B2F" 
            strokeWidth={strokeWidth} 
            strokeDasharray={cProt} 
            strokeDashoffset={offsetProt} 
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Carbs Ring - Turmeric Gold (#E9A84C) */}
          <circle 
            cx="50" 
            cy="50" 
            r={rCarb} 
            fill="none" 
            stroke="#E9A84C" 
            strokeWidth={strokeWidth} 
            strokeDasharray={cCarb} 
            strokeDashoffset={offsetCarb} 
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Fat Center Hub Core dot - Royal Slate Blue */}
          <circle cx="50" cy="50" r="5" fill="#7A6C5D" />
        </svg>

        {/* Small text overlay in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="font-mono text-xs font-bold text-[#1C1412] mt-0.5">{calories}</span>
          <span className="text-[7px] uppercase tracking-wider text-[#7A6C5D] font-bold">Kcal</span>
        </div>
      </div>

      {/* Outward Legend Labels */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 w-full text-center text-[9px] font-mono border-t border-[#E8E0D0] border-dashed pt-2 mt-1 select-none">
        <div className="flex items-center gap-1.5 justify-start text-[#2D6A4F] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
          <span>🥗 {calories} kcal</span>
        </div>
        <div className="flex items-center gap-1.5 justify-start text-[#C84B2F] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C84B2F]" />
          <span>🍗 {protein}g Prot</span>
        </div>
        <div className="flex items-center gap-1.5 justify-start text-[#E9A84C] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E9A84C]" />
          <span>🌾 {carbs}g Carb</span>
        </div>
        <div className="flex items-center gap-1.5 justify-start text-[#7A6C5D] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A6C5D]" />
          <span>🧈 {fat}g Fat</span>
        </div>
      </div>
    </div>
  );
}
