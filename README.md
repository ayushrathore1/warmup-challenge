# The Efficient Day Plan: Personal Indian Cooking & Meal Planning Assistant

A highly polished, responsive, and robust full-stack AI-powered meal planning application. Designed to plan your cooking around a busy schedule, evaluate financial feasibility in Indian Rupees (₹), and calculate complete nutritional metrics.

---

## 🌟 Core Features

### 1. Adaptive AI Meal Plan Curation (Dual-Core Engine)
- **Groq API Acceleration**: Uses the high-speed Llama 3.3 70B model (`llama-3.3-70b-versatile`) via the `GROQ_API_KEY` secret.
- **Fail-safe Gemini Fallback**: Gracefully falls back to Google's ultra-fast `gemini-3.5-flash` model if Groq keys are not configured or valid.
- **Context-Aware Scheduling**: Evaluates the user's workload, energy levels, and busy hours to plan meals. For example, suggesting zero-prep overnight breakfasts for hectic mornings, sustaining mid-day lunches, and cozy, comforting single-pot dinners for late nights.

### 2. High-Precision Indian Financial & Sourcing Auditing
- **Rupee Cost Analysis (₹)**: Estimates precise domestic grocery costs based on realistic Indian markets.
- **Feasibility Auditor**: Classifies financial health under three customized thresholds:
  - **Thrifty Tier (Under ₹300)**: Budget-friendly culinary options leveraging standard pantry staples.
  - **Balanced Tier (₹300 – ₹700)**: Moderate cost options emphasizing fresh domestic produce and staple grains.
  - **Premium Tier (Over ₹700)**: Features richer protein cuts, fresh dairy, or gourmet visual garnishes.
- **Sourcing & Optimization Tips**: Yields local logistics savings tips (e.g., batch prepping, seasonal alternatives, ingredient storage).

### 3. Comprehensive Nutrition Tracking
- Calculates and visualizes real-time nutritional diagnostics for every breakfast, lunch, and dinner choice:
  - ⚡ **Calories** (kcal)
  - 💪 **Protein** (grams)
  - 🍞 **Carbohydrates** (grams)
  - 🥑 **Fat** (grams)

### 4. Interactive Cooking Dashboard & Checklist Tracker
- **Step-by-Step Cooking Walkthroughs**: Displays bite-sized, sequential, and clickable recipes. Users can mark off active steps as they prep.
- **Refined Grocery Tracker Sidebar**: Automatically constructs an interactive interactive grocery checklist with quantities and estimated costs.
- **Intelligent Local Substitutions**: Automatically proposes regional substitutes for scarce or premium ingredients (e.g., coconut milk instead of almond milk, frozen pulp instead of off-season mangoes).
- **One-Click Shopping Export**: Formats the physical groceries list and suggested substitutions, copying it seamlessly to the clipboard.

---

## 🛠️ Architerctural Design & Technologies

- **Frontend**: React 18 with Vite, designed using a Swiss-inspired minimalist neutral palette (warm off-whites, textured stone-grays, and deep obsidian highlights). Fully responsive across all devices (Desktop, Tablet, Mobile) and styled natively with custom layout animations.
- **Backend Service**: Express.js server routing requests securely to AI interfaces. Implements proxy API routes to prevent exposing sensitive developer secrets to the web browser.
- **Design Foundations**: Lucide-React vector graphics, sophisticated serif/sans-serif typographical pairs, and a zero-clutter professional status hierarchy.

---

## ⚙️ Environment Configuration

To configure this applet locally or inside the AI Studio container, ensure these keys are represented in your secret/`.env` environment:

```env
# Optional: Primary high-speed LLM model setup
GROQ_API_KEY="your_groq_api_key_here"

# Required: Backup AI generation service fallback
GEMINI_API_KEY="your_gemini_api_key_here"
```
