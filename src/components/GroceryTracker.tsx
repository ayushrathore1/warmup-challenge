import React, { useState, useEffect } from "react";
import { GroceryItem, Substitution } from "../types";
import { Check, RefreshCw } from "lucide-react";

interface GroceryTrackerProps {
  groceryList: GroceryItem[];
  substitutions: Substitution[];
  feasibility: string;
}

export default function GroceryTracker({ groceryList, substitutions, feasibility }: GroceryTrackerProps) {
  const [items, setItems] = useState<(GroceryItem & { checked: boolean })[]>([]);

  // Sync state if initial list updates
  useEffect(() => {
    setItems(groceryList.map((i) => ({ ...i, checked: false })));
  }, [groceryList]);

  const toggleCheck = (index: number) => {
    const updated = [...items];
    updated[index].checked = !updated[index].checked;
    setItems(updated);
  };

  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const checkedCost = items.reduce((sum, item) => sum + (item.checked ? item.estimatedCost : 0), 0);
  const remainingCost = totalCost - checkedCost;

  // Rubber stamp color mapping for receipt
  const getStampClasses = () => {
    switch (feasibility.toLowerCase()) {
      case "thrifty":
        return "border-[#27500A] text-[#27500A] bg-[#EAF3DE]/30";
      case "premium":
        return "border-[#7F1D1D] text-[#7F1D1D] bg-[#FDF0ED]/30";
      case "balanced":
      default:
        return "border-[#854F0B] text-[#854F0B] bg-[#FEF9EE]/30";
    }
  };

  return (
    <div className="space-y-6 text-[#1C1412]" id="market-receipt-and-swaps">
      
      {/* 1. THE INDIAN bazaar receipt (chit) */}
      <div className="bg-[#FAF7F2] border-[3px] border-double border-[#D4C5B0] rounded-lg p-5 md:p-6 shadow-sm relative overflow-hidden font-mono text-xs">
        
        {/* Decorative receipt jagged edges or stamp effect */}
        <div className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border-2 border-dashed rotate-[12deg] ${getStampClasses()}`}>
          {feasibility || "balanced"}
        </div>

        {/* Paper receipt header */}
        <div className="text-center space-y-1 pb-4 border-b-2 border-dashed border-[#D4C5B0] mb-4">
          <div className="font-serif text-lg font-bold uppercase text-[#1C1412]">KIRANA MARKET CHIT</div>
          <div className="text-[10px] text-[#7A6C5D] font-sans">Indian Spice & Provision List</div>
          <div className="text-[8px] text-[#7A6C5D] font-sans">Khar Baoli, Old Delhi, India</div>
        </div>

        {/* Receipt items with dotted spacer fill */}
        <div className="space-y-3.5 my-4">
          {items.map((item, idx) => {
            // dots calculation layout estimation
            const textLeft = `${item.checked ? "✓ " : "  "}${item.item} (${item.quantity})`;
            const costRight = `₹${item.estimatedCost}`;
            
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className="flex items-end justify-between cursor-pointer group select-none hover:text-[#C84B2F]"
                title="Click to check / uncheck item"
              >
                {/* Checkbox and Item Name */}
                <span className="flex items-center gap-1.5 min-w-0 pr-2">
                  <span className={`w-3.5 h-3.5 border border-[#D4C5B0] rounded bg-white flex items-center justify-center shrink-0 ${item.checked ? "bg-[#2D6A4F] border-[#2D6A4F] text-white" : ""}`}>
                    {item.checked && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                  </span>
                  <span className={`truncate text-left ${item.checked ? "line-through text-[#7A6C5D]/65 italic" : "text-[#1C1412]"}`}>
                    {item.item} <span className="text-[10px] text-[#7A6C5D]">({item.quantity})</span>
                  </span>
                </span>

                {/* Dots connector */}
                <span className="border-b-2 border-dotted border-[#D4C5B0] flex-1 mx-1 h-3 group-hover:border-[#C84B2F]/60" />

                {/* Estimate Cost */}
                <span className={`shrink-0 font-bold ${item.checked ? "text-[#7A6C5D]/65" : "text-[#1C1412]"}`}>
                  ₹{item.estimatedCost}
                </span>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-left italic text-[#7A6C5D] py-10 text-center font-sans">
              * Ledger is vacant. *<br />
              Define your day’s menu to write Kirana items.
            </div>
          )}
        </div>

        {/* Double-ruled TOTAL box */}
        {items.length > 0 && (
          <div className="border-t-[3px] border-double border-[#1C1412] mt-6 pt-3 space-y-1 bg-[#FAF7F2]">
            <div className="flex justify-between font-bold text-sm">
              <span>ESTIMATED SUM:</span>
              <span>₹{totalCost}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#2D6A4F] font-bold">
              <span>UNBOUGHT REMAINING:</span>
              <span>₹{remainingCost}</span>
            </div>
            <div className="text-[8px] text-[#7A6C5D] font-sans italic text-right mt-2 pt-1 border-t border-dashed border-[#D4C5B0]">
              * Tax estimation inclusive of local mandi markets.
            </div>
          </div>
        )}
      </div>

      {/* 2. INGREDIENT SUBSTITUTION "SWAP CHITS" */}
      {substitutions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7A6C5D] px-1 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#C84B2F]" />
            Alternative "Swap Chits"
          </h4>
          
          <div className="space-y-4">
            {substitutions.map((sub, idx) => (
              <div 
                key={idx}
                className="bg-white border border-[#E8E0D0] rounded-lg p-3 shadow-xs font-sans space-y-2 relative"
                id={`swap-chit-${idx}`}
              >
                {/* Visual split card */}
                <div className="grid grid-cols-2 text-center text-xs divide-x-2 divide-dashed divide-[#E8E0D0] relative">
                  
                  {/* Left Half: Original */}
                  <div className="pr-2 py-1 bg-[#FDF0ED] rounded-l-md flex flex-col justify-center min-h-[50px]">
                    <span className="text-[8px] uppercase tracking-wider font-bold text-red-700/80 mb-0.5">Original Item</span>
                    <span className="font-serif italic line-through text-[#7F1D1D] font-medium leading-tight">{sub.original}</span>
                  </div>

                  {/* Swap badge center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-[#E8E0D0] rounded-full flex items-center justify-center text-[10px] font-bold text-[#C84B2F] shadow-xs select-none">
                    ⇄
                  </div>

                  {/* Right Half: Substitute */}
                  <div className="pl-3 py-1 bg-[#EAF3DE] rounded-r-md flex flex-col justify-center min-h-[50px]">
                    <span className="text-[8px] uppercase tracking-wider font-bold text-[#27500A]/80 mb-0.5">Best Substitute</span>
                    <span className="font-serif italic font-semibold text-[#27500A] leading-tight">{sub.substitute}</span>
                  </div>

                </div>

                {/* Reason text below */}
                <div className="text-[10px] text-[#7A6C5D] italic leading-relaxed pt-1 flex items-start gap-1">
                  <span className="text-[#C84B2F] font-serif shrink-0">✦</span>
                  <p className="font-mono text-[9px] text-left">Swap rationale: {sub.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
