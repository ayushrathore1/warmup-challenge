import React from "react";
import { BudgetDetail } from "../types";
import { Sparkles, BarChart2 } from "lucide-react";

interface BudgetOverviewProps {
  budget: BudgetDetail;
}

export default function BudgetOverview({ budget }: BudgetOverviewProps) {
  const { totalEstimated, feasibility = "balanced", tips = [] } = budget;

  // Ledger schema mapping (thrifty, balanced, premium)
  const tierSettings = {
    thrifty: {
      bg: "bg-[#EAF3DE] border-[#A3D169]/30",
      text: "text-[#27500A]",
      accentBg: "bg-[#27500A]",
      description: "Under ₹300 total cost. Relies beautifully on stock pantry grains and local vegetables.",
      label: "Thrifty Ledger Stamp",
    },
    balanced: {
      bg: "bg-[#FEF9EE] border-[#E9A84C]/30",
      text: "text-[#854F0B]",
      accentBg: "bg-[#854F0B]",
      description: "₹300 – ₹700 cost range. Balanced buy of fresh produce with staple grains.",
      label: "Balanced Ledger Stamp",
    },
    premium: {
      bg: "bg-[#FDF0ED] border-[#C84B2F]/30",
      text: "text-[#7F1D1D]",
      accentBg: "bg-[#C84B2F]",
      description: "Over ₹700 cost range. Incorporates premium dairy, rich paneer cuts, or elaborate spices.",
      label: "Premium Ledger Stamp",
    }
  };

  const currentTier = (feasibility.toLowerCase() as "thrifty" | "balanced" | "premium") || "balanced";
  const styles = tierSettings[currentTier] || tierSettings.balanced;

  // Determine meter position marker percentage
  let markerPercentage = 50;
  if (totalEstimated <= 300) {
    markerPercentage = (totalEstimated / 300) * 33;
  } else if (totalEstimated <= 700) {
    markerPercentage = 33 + ((totalEstimated - 300) / 400) * 33;
  } else {
    markerPercentage = 66 + (Math.min(totalEstimated - 700, 500) / 500) * 34;
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] shadow-sm p-6 md:p-8 space-y-6 text-[#1C1412]" id="ledger-budget-audit">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-dashed border-[#E8E0D0] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#7A6C5D] block mb-1">
            Financial Audit
          </span>
          <h3 className="text-2xl font-serif text-[#1C1412] leading-tight flex items-center gap-2">
            Feasibility Evaluation
          </h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-[#7A6C5D] bg-[#FAF7F2] border border-[#E8E0D0] px-2 py-0.5 rounded uppercase">
          {budget.currency || "INR"} (₹)
        </span>
      </div>

      {/* Rubber Stamp Stamp Style Badge */}
      <div className={`p-5 rounded-xl border ${styles.bg} transition-all duration-300 relative overflow-hidden`}>
        {/* Visual rubber stamp water-mark background effect */}
        <div className="absolute right-[-15px] top-[-10px] opacity-[0.06] select-none text-6xl font-bold font-serif rotate-12">
          LEDGER
        </div>

        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D]">
              ESTIMATED BASKET OUTLAY
            </span>
            <div className="text-4xl font-serif italic text-[#1C1412] mt-1">
              ₹{totalEstimated}
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#7A6C5D]">
              TIER STAMP
            </span>
            <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border-2 border-dashed mt-1.5 rotate-[-4deg] ${styles.text}`}>
              {feasibility.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="border-t border-[#E8E0D0] border-dashed pt-3 mt-4">
          <p className="text-xs font-sans text-[#7A6C5D] leading-relaxed">
            <strong className="font-bold text-[#1C1412]">Evaluation:</strong> {styles.description}
          </p>
        </div>
      </div>

      {/* Visual meter */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider font-bold text-[#7A6C5D] block">
          Scale of Outlay Range
        </label>
        <div className="h-5 w-full bg-[#FAF7F2] rounded-md border border-[#E8E0D0] relative overflow-hidden flex text-[9px] font-mono text-[#7A6C5D]/75">
          <div className="h-full w-1/3 flex items-center justify-center border-r border-[#E8E0D0] bg-[#EAF3DE]/35">Thrifty (&lt;₹300)</div>
          <div className="h-full w-1/3 flex items-center justify-center border-r border-[#E8E0D0] bg-[#FEF9EE]/35">Balanced (₹300–700)</div>
          <div className="h-full w-1/3 flex items-center justify-center bg-[#FDF0ED]/35">Premium (&gt;₹700)</div>
          
          {/* Tracker marker tick */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-[#C84B2F] shadow-xs transition-all duration-700"
            style={{ left: `${markerPercentage}%` }}
          />
        </div>
        <div className="text-[10px] text-[#7A6C5D] italic text-center mt-1 font-sans flex items-center justify-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-[#C84B2F]" />
          <span>The current basket cost is ₹{totalEstimated} for ingredients needed.</span>
        </div>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="border-t border-[#E8E0D0] border-dashed pt-4 space-y-3">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7A6C5D] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E9A84C]" />
            Local Sourcing & Optimization Tips
          </h4>
          <ul className="space-y-2.5">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-[#7A6C5D] leading-relaxed">
                <span className="text-[#C84B2F] font-serif shrink-0">✦</span>
                <p className="border-b border-dashed border-[#E8E0D0] pb-1 flex-1 font-serif italic text-left">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
