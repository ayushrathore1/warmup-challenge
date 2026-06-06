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
- Calculates and visualizes real-time nutritional diagnostics for every breakfast, lunch, and dinner choice using an elegant concentric thali-plate SVG dial:
  - ⚡ **Calories** (kcal)
  - 💪 **Protein** (grams)
  - 🍞 **Carbohydrates** (grams)
  - 🥑 **Fat** (grams)

### 4. Interactive Cooking Dashboard & Checklist Tracker
- **Step-by-Step Cooking Walkthroughs**: Displays bite-sized, sequential, and clickable recipes. Users can mark off active steps as they prep.
- **Refined Grocery Tracker Sidebar**: Automatically constructs an interactive grocery checklist with quantities and estimated costs formatted as a vintage Kirana market receipt.
- **Intelligent Local Substitutions**: Automatically proposes regional substitutes for scarce or premium ingredients (e.g., coconut milk instead of almond milk, frozen pulp instead of off-season mangoes).
- **One-Click Shopping Export**: Formats the physical groceries list and suggested substitutions, copying it seamlessly to the clipboard.

---

## 🛠️ Architectural Design & Technologies

- **Frontend**: React 18 with Vite, designed using a Swiss-inspired minimalist neutral palette (warm off-whites, textured stone-grays, and deep obsidian highlights). Fully responsive across all devices (Desktop, Tablet, Mobile) and styled natively with custom layout animations.
- **Backend Service**: Express.js server routing requests securely to AI interfaces. Implements proxy API routes to prevent exposing sensitive developer secrets to the web browser.
- **Design Foundations**: Lucide-React vector graphics, sophisticated serif/sans-serif typographical pairs, and a zero-clutter professional status hierarchy.

---

## ⚙️ Environment Configuration

To configure this applet locally or inside your staging environment, ensure these keys are represented in your `.env` or cloud secret environment:

```env
# Optional: Primary high-speed LLM model setup
GROQ_API_KEY="your_groq_api_key_here"

# Required: Backup AI generation service fallback
GEMINI_API_KEY="your_gemini_api_key_here"
```

---

## 🚀 Deployment Guide

This full-stack application utilizes a bundled Express.js backend that serves Vite static frontend assets in production. Follow the guides below to host it on **Render** (highly recommended for full-stack Node.js servers) or **Vercel**.

### Prerequisites & Git Initialization

First, initialize a git repository locally and push your code to your GitHub account:

```bash
# Initialize git and stage all files
git init
git add .
git commit -m "feat: initial commit of the efficient day plan ledger"

# Create a new repository on your GitHub account, then link and push
git remote add origin https://github.com/yourusername/efficient-day-plan.git
git branch -M main
git push -u origin main
```

---

### Option A: Deploying on Render (Recommended)

Render naturally hosts continuous Node.js Web Services and handles our custom bundling configuration seamlessly.

#### 1. Create a New Web Service on Render
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your GitHub repository.

#### 2. Configure Build and Run Settings
Fill in the following parameters during creation:
- **Language**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (or any Tier)

#### 3. Set Environment Variables
Navigate to the **Environment** tab of your service and add:
- `NODE_ENV` = `production`
- `GEMINI_API_KEY` = `your_actual_gemini_api_key`
- `GROQ_API_KEY` = `your_actual_groq_api_key` (Optional)

Render will automatically provision an SSL certificate and spin up your server binded to port `3000`.

---

### Option B: Deploying on Vercel

Vercel is primarily built for serverless deployment. To deploy this full-stack Express + React application on Vercel as an integrated serverless application, create a `vercel.json` configuration file.

#### 1. Create `vercel.json` in your Root Directory
Create a file named `vercel.json` in the root of the project to forward all API routes to our server:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.cjs",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/server.cjs"
    },
    {
      "src": "/assets/(.*)",
      "dest": "dist/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 2. Push and Import on Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Connect your GitHub repository.
3. In the **Environment Variables** section, configure:
   - `GEMINI_API_KEY` = `your_gemini_api_key`
   - `GROQ_API_KEY` = `your_groq_api_key` (Optional)
4. Under **Build & Development Settings**, keep defaults or ensure they match `npm run build`.
5. Click **Deploy**. Vercel will build your static files and map the dynamic `/api/*` endpoints to a Serverless Node Function.
