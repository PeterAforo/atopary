"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Loader2, Bot,
  Home, CreditCard, HelpCircle, ChevronRight, RotateCcw, Calculator,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: QuickAction[];
}

interface QuickAction {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Conversation states for multi-step flows
type ConvoState =
  | "idle"
  | "mortgage_ask_price"
  | "mortgage_ask_income"
  | "mortgage_ask_down"
  | "installment_ask_price"
  | "installment_ask_months"
  | "budget_ask";

interface ConvoContext {
  state: ConvoState;
  propertyPrice?: number;
  monthlyIncome?: number;
  downPaymentPct?: number;
  installmentMonths?: number;
}

// ─── Constants ───────────────────────────────────────────────────
const MAIN_ACTIONS: QuickAction[] = [
  { label: "Buy a Property", value: "buy property", icon: Home },
  { label: "Payment Options", value: "payment options", icon: CreditCard },
  { label: "Mortgage Calculator", value: "calculate mortgage", icon: Calculator },
  { label: "Help", value: "help", icon: HelpCircle },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// ─── Number parser — handles GHC10k, 500K, 10,000, GH₵8000 etc ─
function parseAmount(text: string): number | null {
  const cleaned = text
    .replace(/,/g, "")
    .replace(/gh[₵c¢s]/gi, "")
    .replace(/cedis?/gi, "")
    .trim();

  // Match number with optional k/m suffix
  const match = cleaned.match(/([\d.]+)\s*([km])?/i);
  if (!match) return null;
  let num = parseFloat(match[1]);
  if (isNaN(num)) return null;
  const suffix = (match[2] || "").toLowerCase();
  if (suffix === "k") num *= 1_000;
  if (suffix === "m") num *= 1_000_000;
  return num > 0 ? num : null;
}

// Extract first number-like thing from a string
function extractNumber(text: string): number | null {
  // Try to find something that looks like an amount
  const patterns = [
    /gh[₵c¢s]?\s*[\d,.]+\s*[km]?/i,
    /[\d,.]+\s*[km]/i,
    /[\d,]+\.?\d*/,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const val = parseAmount(m[0]);
      if (val !== null) return val;
    }
  }
  return null;
}

// Extract percentage from text
function extractPercent(text: string): number | null {
  const m = text.match(/([\d.]+)\s*%/);
  if (m) return parseFloat(m[1]);
  return null;
}

// ─── Mortgage math ───────────────────────────────────────────────
function calcMonthlyPayment(price: number, downPct: number, rate: number, years: number) {
  const loan = price * (1 - downPct / 100);
  const mr = rate / 100 / 12;
  const n = years * 12;
  if (mr === 0) return loan / n;
  return loan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

function buildMortgageResult(price: number, income: number, downPct: number): string {
  const rate = 22;
  const years = 20;
  const monthly = calcMonthlyPayment(price, downPct, rate, years);
  const maxAfford = income * 0.4;
  const eligible = monthly <= maxAfford;
  const dp = price * downPct / 100;
  const loan = price - dp;

  return `**Mortgage Eligibility Result** 📊\n\n` +
    `| Detail | Amount |\n` +
    `|---|---|\n` +
    `| Property Price | ${formatCurrency(price)} |\n` +
    `| Down Payment (${downPct}%) | ${formatCurrency(dp)} |\n` +
    `| Loan Amount | ${formatCurrency(loan)} |\n` +
    `| Interest Rate | ${rate}% p.a. |\n` +
    `| Loan Term | ${years} years |\n` +
    `| **Monthly Payment** | **${formatCurrency(Math.round(monthly))}** |\n\n` +
    `Your monthly income: **${formatCurrency(income)}**\n` +
    `Max affordable payment (40% of income): **${formatCurrency(Math.round(maxAfford))}**\n\n` +
    (eligible
      ? `✅ **You are likely ELIGIBLE!** Your payment of ${formatCurrency(Math.round(monthly))}/month is within your limit of ${formatCurrency(Math.round(maxAfford))}/month.\n\nYou can proceed to apply for a mortgage through any property page on our site, or I can help you browse properties in your budget.`
      : `⚠️ **You may not qualify** at this amount. The payment of ${formatCurrency(Math.round(monthly))}/month exceeds your limit of ${formatCurrency(Math.round(maxAfford))}/month.\n\n**What you can do:**\n- Increase your down payment above ${downPct}%\n- Look at properties under ${formatCurrency(Math.round(maxAfford / (rate / 100 / 12) * (1 - Math.pow(1 + rate / 100 / 12, -years * 12)) / (1 - downPct / 100)))}\n- Consider our installment plan instead\n- Extend the loan term`);
}

function buildInstallmentResult(price: number, months: number): string {
  const deposit = price * 0.3;
  const balance = price - deposit;
  const interestRate = 0.08;
  const totalInterest = balance * interestRate * (months / 12);
  const totalPayable = balance + totalInterest;
  const monthly = totalPayable / months;

  return `**Installment Plan Calculation** 📋\n\n` +
    `| Detail | Amount |\n` +
    `|---|---|\n` +
    `| Property Price | ${formatCurrency(price)} |\n` +
    `| Deposit (30%) | ${formatCurrency(deposit)} |\n` +
    `| Balance | ${formatCurrency(balance)} |\n` +
    `| Duration | ${months} months |\n` +
    `| Interest (~8% p.a.) | ${formatCurrency(Math.round(totalInterest))} |\n` +
    `| **Monthly Payment** | **${formatCurrency(Math.round(monthly))}** |\n\n` +
    `Total amount payable: **${formatCurrency(Math.round(deposit + totalPayable))}**\n\n` +
    `To proceed, browse our properties and send an inquiry mentioning you'd like to use the installment plan. Our team will arrange everything for you.`;
}

// ─── Intent detection ────────────────────────────────────────────
function detectIntent(msg: string): string {
  const m = msg.toLowerCase();
  if (/\b(hello|hi|hey|good\s*(morning|afternoon|evening|day))\b/.test(m)) return "greeting";
  if (/\b(buy|purchase|looking for|want\s+(a\s+)?property|find\s+(a\s+)?home)\b/.test(m)) return "buy";
  if (/\b(outright|full\s+pay|pay\s+full|cash\s+pay|lump\s*sum)\b/.test(m)) return "outright";
  if (/\b(install?ment|spread|payment\s+plan|pay\s+monthly|pay\s+over)\b/.test(m)) return "installment";
  if (/\b(calculat|eligib|afford|qualify|how\s+much.*mortgage|check.*mortgage|mortgage.*calc)\b/.test(m)) return "mortgage_calc";
  if (/\b(mortgage|home\s*loan|bank\s*loan|financ|loan)\b/.test(m)) return "mortgage_info";
  if (/\b(apply|application|sign\s*up|register|submit)\b/.test(m)) return "apply";
  if (/\b(browse|show|view|see|list|available|properties|search)\b/.test(m)) return "browse";
  if (/\b(contact|phone|email|call|reach|office|address)\b/.test(m)) return "contact";
  if (/\b(payment|option|ways?\s+to\s+pay|how\s+to\s+pay|method)\b/.test(m)) return "payment_options";
  if (/\b(about|who|what\s+is\s+atopary|company|services)\b/.test(m)) return "about";
  if (/\b(thank|thanks|cheers)\b/.test(m)) return "thanks";
  if (/\b(help|support|assist|what\s+can\s+you)\b/.test(m)) return "help";
  if (/\b(budget|afford|price\s+range|how\s+much\s+can\s+i)\b/.test(m)) return "budget";
  if (/\b(yes|yeah|yep|sure|ok|okay|go\s+ahead|proceed|let'?s\s+go|do\s+it|please)\b/.test(m)) return "yes";
  if (/\b(no|nah|nope|not\s+now|later|maybe|cancel|nevermind|never\s+mind)\b/.test(m)) return "no";
  return "unknown";
}

// ─── Conversation engine ─────────────────────────────────────────
interface JudeResponse {
  content: string;
  actions?: QuickAction[];
  newCtx: ConvoContext;
}

function processMessage(userMsg: string, ctx: ConvoContext): JudeResponse {
  const intent = detectIntent(userMsg);
  const num = extractNumber(userMsg);
  const pct = extractPercent(userMsg);

  // ─── Handle active multi-step flows FIRST ────────────────────
  if (ctx.state === "mortgage_ask_price") {
    if (num && num >= 1000) {
      return {
        content: `Got it — property price: **${formatCurrency(num)}**.\n\nNow, what is your **monthly gross income**? (e.g. "GHC8000" or "5k")`,
        newCtx: { ...ctx, state: "mortgage_ask_income", propertyPrice: num },
      };
    }
    return {
      content: `I need the **property price** to calculate your mortgage. Please enter an amount like **"GHC500000"**, **"500k"**, or **"GH₵300,000"**.`,
      newCtx: ctx,
    };
  }

  if (ctx.state === "mortgage_ask_income") {
    if (num && num >= 100) {
      return {
        content: `Great — monthly income: **${formatCurrency(num)}**.\n\nWhat **down payment percentage** can you make? The minimum is usually 20%.\n\n(Just type a number like **"20"** or **"25%"**, or say **"skip"** and I'll use 20%)`,
        newCtx: { ...ctx, state: "mortgage_ask_down", monthlyIncome: num },
        actions: [
          { label: "20%", value: "20%", icon: Calculator },
          { label: "25%", value: "25%", icon: Calculator },
          { label: "30%", value: "30%", icon: Calculator },
        ],
      };
    }
    return {
      content: `I need your **monthly gross income**. Please enter an amount like **"GHC8000"**, **"10k"**, or **"5,000"**.`,
      newCtx: ctx,
    };
  }

  if (ctx.state === "mortgage_ask_down") {
    let downPct = pct ?? (num && num <= 90 ? num : null);
    const skip = /skip|default/i.test(userMsg);
    if (skip) downPct = 20;
    if (downPct !== null && downPct >= 5 && downPct <= 90) {
      const result = buildMortgageResult(ctx.propertyPrice!, ctx.monthlyIncome!, downPct);
      return {
        content: result,
        newCtx: { state: "idle" },
        actions: [
          { label: "Apply for Mortgage", value: "apply for mortgage", icon: CreditCard },
          { label: "Try Different Numbers", value: "calculate mortgage", icon: Calculator },
          { label: "Installment Plan", value: "installment plan", icon: CreditCard },
          { label: "Browse Properties", value: "browse properties", icon: Home },
        ],
      };
    }
    return {
      content: `Please enter a **down payment percentage** between 5% and 90%. For example: **"20"** or **"25%"**.\n\nOr type **"skip"** to use the default 20%.`,
      newCtx: ctx,
      actions: [
        { label: "20%", value: "20%", icon: Calculator },
        { label: "Skip (use 20%)", value: "skip", icon: Calculator },
      ],
    };
  }

  if (ctx.state === "installment_ask_price") {
    if (num && num >= 1000) {
      return {
        content: `Property price: **${formatCurrency(num)}**.\n\nOver how many **months** would you like to pay? (6 to 24 months)`,
        newCtx: { ...ctx, state: "installment_ask_months", propertyPrice: num },
        actions: [
          { label: "6 months", value: "6", icon: Calculator },
          { label: "12 months", value: "12", icon: Calculator },
          { label: "18 months", value: "18", icon: Calculator },
          { label: "24 months", value: "24", icon: Calculator },
        ],
      };
    }
    return {
      content: `I need the **property price** to calculate installments. Please enter an amount like **"GHC400000"**, **"400k"**, or **"GH₵250,000"**.`,
      newCtx: ctx,
    };
  }

  if (ctx.state === "installment_ask_months") {
    const months = num && num >= 1 && num <= 60 ? Math.round(num) : null;
    if (months) {
      const result = buildInstallmentResult(ctx.propertyPrice!, months);
      return {
        content: result,
        newCtx: { state: "idle" },
        actions: [
          { label: "Browse Properties", value: "browse properties", icon: Home },
          { label: "Try Different Numbers", value: "installment plan calculate", icon: Calculator },
          { label: "Mortgage Instead", value: "calculate mortgage", icon: Calculator },
        ],
      };
    }
    return {
      content: `Please enter the **number of months** (6 to 24). For example: **"12"** or **"18 months"**.`,
      newCtx: ctx,
      actions: [
        { label: "12 months", value: "12", icon: Calculator },
        { label: "24 months", value: "24", icon: Calculator },
      ],
    };
  }

  if (ctx.state === "budget_ask") {
    if (num && num >= 100) {
      const income = num;
      const rate = 22;
      const years = 20;
      const maxPayment = income * 0.4;
      const mr = rate / 100 / 12;
      const n = years * 12;
      const maxLoan = maxPayment * (Math.pow(1 + mr, n) - 1) / (mr * Math.pow(1 + mr, n));
      const maxPrice80 = maxLoan / 0.8; // assuming 20% down

      return {
        content: `**Based on your income of ${formatCurrency(income)}/month:**\n\n` +
          `With a standard mortgage (20% down, 22% rate, 20 years):\n\n` +
          `- Max affordable monthly payment: **${formatCurrency(Math.round(maxPayment))}**\n` +
          `- Max loan amount: **${formatCurrency(Math.round(maxLoan))}**\n` +
          `- Max property price: **~${formatCurrency(Math.round(maxPrice80))}**\n\n` +
          `Would you like to browse properties in this price range, or calculate for a specific property?`,
        newCtx: { state: "idle", monthlyIncome: income },
        actions: [
          { label: "Browse Properties", value: "browse properties", icon: Home },
          { label: "Calculate for Specific Property", value: "calculate mortgage", icon: Calculator },
        ],
      };
    }
    return {
      content: `What is your **monthly gross income**? For example: **"GHC8000"**, **"10k"**, or **"5,000"**.`,
      newCtx: ctx,
    };
  }

  // ─── If user says "yes" in idle, interpret based on recent context
  if (intent === "yes" && ctx.state === "idle") {
    return {
      content: `Sure! What would you like to do?`,
      newCtx: ctx,
      actions: MAIN_ACTIONS,
    };
  }

  if (intent === "no" && ctx.state === "idle") {
    return {
      content: `No problem! If you need anything later, just ask. I'm always here to help. 😊`,
      newCtx: ctx,
      actions: MAIN_ACTIONS,
    };
  }

  // ─── If user provides a number in idle state, they probably want a calculation
  if (intent === "unknown" && num && num >= 1000 && ctx.state === "idle") {
    return {
      content: `I see you entered **${formatCurrency(num)}**. What would you like to do with this amount?`,
      newCtx: ctx,
      actions: [
        { label: "Mortgage Eligibility for This Price", value: `mortgage for ${num}`, icon: Calculator },
        { label: "Installment Plan for This Price", value: `installment for ${num}`, icon: CreditCard },
        { label: "Properties Under This Price", value: "browse properties", icon: Home },
      ],
    };
  }

  // ─── Handle "mortgage for AMOUNT" (from quick action above)
  if (/mortgage\s+for\s+/i.test(userMsg) && num) {
    return {
      content: `Property price: **${formatCurrency(num)}**.\n\nWhat is your **monthly gross income**? (e.g. "GHC8000" or "5k")`,
      newCtx: { state: "mortgage_ask_income", propertyPrice: num },
    };
  }
  if (/installment\s+for\s+/i.test(userMsg) && num) {
    return {
      content: `Property price: **${formatCurrency(num)}**.\n\nOver how many **months** would you like to pay? (6 to 24)`,
      newCtx: { state: "installment_ask_months", propertyPrice: num },
      actions: [
        { label: "6 months", value: "6", icon: Calculator },
        { label: "12 months", value: "12", icon: Calculator },
        { label: "18 months", value: "18", icon: Calculator },
        { label: "24 months", value: "24", icon: Calculator },
      ],
    };
  }

  // ─── Standard intents ──────────────────────────────────────────
  if (intent === "greeting") {
    return {
      content: `Hello! 👋 Welcome to Atopary Properties. I'm **Jude**, your personal real estate assistant.\n\nI can help you:\n- **Buy a property** (cash, installments, or mortgage)\n- **Calculate mortgage eligibility**\n- **Find properties** that match your budget\n- **Apply** for financing\n\nWhat would you like to do?`,
      newCtx: { state: "idle" },
      actions: MAIN_ACTIONS,
    };
  }

  if (intent === "buy") {
    return {
      content: `Great! 🏠 Atopary offers **3 ways** to buy a property:\n\n**1. Outright Payment** — Pay the full price and own it immediately. No interest.\n\n**2. Installment Plan** — Pay 30% deposit, then spread the rest over 6–24 months.\n\n**3. Mortgage** — Finance up to 80% through our partner banks, repay over 5–25 years.\n\nWhich interests you? Or tell me your **budget** and I'll tell you what you can afford.`,
      newCtx: { state: "idle" },
      actions: [
        { label: "Outright Payment", value: "outright payment", icon: CreditCard },
        { label: "Installment Plan", value: "installment plan", icon: CreditCard },
        { label: "Mortgage", value: "mortgage info", icon: Calculator },
        { label: "What Can I Afford?", value: "what can I afford", icon: HelpCircle },
      ],
    };
  }

  if (intent === "outright") {
    return {
      content: `**Outright Payment** 💰\n\nPay the full property price and own it immediately.\n\n**Benefits:** No interest, instant ownership, faster transaction, better negotiating power.\n\n**Process:**\n1. Find a property on our platform\n2. Send an inquiry through Atopary\n3. We arrange inspection & due diligence\n4. Pay and receive your title\n\n👉 [Browse Properties](/properties)\n\nWould you like to browse properties or explore other payment options?`,
      newCtx: { state: "idle" },
      actions: [
        { label: "Browse Properties", value: "browse properties", icon: Home },
        { label: "Other Payment Options", value: "payment options", icon: CreditCard },
      ],
    };
  }

  if (intent === "installment") {
    const wantsCalc = /calc|for\s+a|specific|how\s+much/i.test(userMsg);
    if (wantsCalc) {
      return {
        content: `Let's calculate your installment plan! 📋\n\nWhat is the **property price**? (e.g. "GHC500000", "400k", or "GH₵300,000")`,
        newCtx: { state: "installment_ask_price" },
      };
    }
    return {
      content: `**Installment Plan** 📋\n\nSpread your payments and own a property without a bank loan.\n\n- **Deposit:** 30% of property price\n- **Duration:** 6 to 24 months\n- **Interest:** ~8% per annum on balance\n\n**Example — GH₵500,000 property:**\n- Deposit: GH₵150,000\n- Balance over 12 months: ~GH₵30,333/month\n\nWant me to calculate for a specific property price?`,
      newCtx: { state: "idle" },
      actions: [
        { label: "Yes, Calculate", value: "calculate installment", icon: Calculator },
        { label: "Browse Properties", value: "browse properties", icon: Home },
        { label: "Other Options", value: "payment options", icon: CreditCard },
      ],
    };
  }

  if (intent === "mortgage_calc") {
    return {
      content: `Let's check your mortgage eligibility! 🧮\n\nI'll walk you through it step by step.\n\n**First, what is the property price?**\n(e.g. "GHC500000", "420k", "GH₵300,000")`,
      newCtx: { state: "mortgage_ask_price" },
    };
  }

  if (intent === "mortgage_info") {
    return {
      content: `**Mortgage Facility** 🏦\n\nWe partner with leading Ghanaian banks to finance your property.\n\n- Finance up to **80%** of property value\n- Repayment: **5–25 years**\n- Rates: **18–24%** per annum\n- For salaried & self-employed\n\n**Requirements:** Ghana Card/passport, income proof, 6-month bank statements, employment letter.\n\n**Rule of thumb:** Your monthly payment must not exceed **40%** of your gross income.\n\nShall I calculate your eligibility?`,
      newCtx: { state: "idle" },
      actions: [
        { label: "Calculate My Eligibility", value: "calculate mortgage", icon: Calculator },
        { label: "Apply for Mortgage", value: "apply for mortgage", icon: CreditCard },
        { label: "Browse Properties", value: "browse properties", icon: Home },
      ],
    };
  }

  if (intent === "apply") {
    return {
      content: `**How to Apply** 📝\n\n**Mortgage Application:**\n1. Go to any property page on our site\n2. Use the **Mortgage Calculator** section\n3. Click **"Apply Now"** after calculating\n4. Our team follows up within 24-48 hours\n\n**Installment Plan:**\n1. Send an inquiry on a property page\n2. Mention you want the **installment plan**\n3. Our team arranges the deposit and agreement\n\nOr visit our [Contact page](/contact) and our specialists will guide you.\n\nWant to browse properties first?`,
      newCtx: { state: "idle" },
      actions: [
        { label: "Browse Properties", value: "browse properties", icon: Home },
        { label: "Contact Atopary", value: "contact", icon: HelpCircle },
      ],
    };
  }

  if (intent === "browse") {
    return {
      content: `🏘️ Browse our properties at **[Properties page](/properties)**.\n\nFilter by location, type, price, and bedrooms.\n\nOnce you find one you like, send an inquiry and our team handles everything from there!`,
      newCtx: { state: "idle" },
      actions: [
        { label: "Payment Options", value: "payment options", icon: CreditCard },
        { label: "Mortgage Calculator", value: "calculate mortgage", icon: Calculator },
      ],
    };
  }

  if (intent === "contact") {
    return {
      content: `**Contact Atopary** 📞\n\n- **Phone:** +233 XX XXX XXXX\n- **Email:** info@atopary.com\n- **Office:** Accra, Ghana\n- **Hours:** Mon–Sat, 8 AM – 6 PM\n\nOr use our **[Contact page](/contact)** to send a message directly.`,
      newCtx: { state: "idle" },
      actions: MAIN_ACTIONS,
    };
  }

  if (intent === "payment_options") {
    return {
      content: `**Payment Options** 💳\n\n**1. Outright** — Full price, own immediately, no interest\n**2. Installment** — 30% deposit, balance over 6–24 months\n**3. Mortgage** — Finance 80% via partner banks, 5–25 year terms\n\nWhich would you like to explore?`,
      newCtx: { state: "idle" },
      actions: [
        { label: "Outright Payment", value: "outright", icon: CreditCard },
        { label: "Installment Plan", value: "installment plan", icon: CreditCard },
        { label: "Mortgage", value: "mortgage info", icon: Calculator },
      ],
    };
  }

  if (intent === "about") {
    return {
      content: `**Atopary Properties** 🏢\n\nGhana's trusted real estate platform.\n\n- Verified property listings across Ghana\n- Secure buyer-seller transactions (we handle all communication)\n- Mortgage & installment assistance\n- Property valuations\n\nAll transactions go through Atopary — safe, transparent, professional.\n\nHow can I help you?`,
      newCtx: { state: "idle" },
      actions: MAIN_ACTIONS,
    };
  }

  if (intent === "budget") {
    return {
      content: `I can tell you what property price you can afford based on your income! 💡\n\nWhat is your **monthly gross income**?\n(e.g. "GHC8000", "10k", "5,000")`,
      newCtx: { state: "budget_ask" },
    };
  }

  if (intent === "thanks") {
    return {
      content: `You're welcome! 😊 Don't hesitate to ask if you need anything else. I'm here whenever you need me. Have a wonderful day! 🏠`,
      newCtx: { state: "idle" },
      actions: MAIN_ACTIONS,
    };
  }

  if (intent === "help") {
    return {
      content: `I'm **Jude**, Atopary's helpdesk assistant. Here's what I can do:\n\n🏠 **Buy a property** — explain purchase options\n💰 **Payment options** — outright, installments, mortgage\n🧮 **Mortgage calculator** — check eligibility step-by-step\n📋 **Installment calculator** — plan monthly payments\n💡 **Budget advisor** — tell you what you can afford\n📝 **Apply** — guide you through applications\n🔍 **Browse** — find properties on our platform\n\nJust tell me what you need!`,
      newCtx: { state: "idle" },
      actions: MAIN_ACTIONS,
    };
  }

  // ─── Fallback — try to be helpful ──────────────────────────────
  // If they typed something with a number, offer to use it
  if (num && num >= 100) {
    return {
      content: `I see **${formatCurrency(num)}**. Would you like me to use this as a property price or your income?`,
      newCtx: { state: "idle" },
      actions: [
        { label: `Mortgage for ${formatCurrency(num)} Property`, value: `mortgage for ${num}`, icon: Calculator },
        { label: `Installment for ${formatCurrency(num)} Property`, value: `installment for ${num}`, icon: CreditCard },
        { label: `This Is My Income`, value: `income ${num} budget`, icon: HelpCircle },
      ],
    };
  }

  // Check for "income XXXX budget" from the quick action above
  if (/income\s+\d/.test(userMsg) && /budget/i.test(userMsg)) {
    const incNum = extractNumber(userMsg);
    if (incNum) {
      const maxPayment = incNum * 0.4;
      const mr = 22 / 100 / 12;
      const n = 20 * 12;
      const maxLoan = maxPayment * (Math.pow(1 + mr, n) - 1) / (mr * Math.pow(1 + mr, n));
      const maxPrice = maxLoan / 0.8;
      return {
        content: `Based on **${formatCurrency(incNum)}/month** income:\n\n- Max monthly payment: **${formatCurrency(Math.round(maxPayment))}**\n- Max property price: **~${formatCurrency(Math.round(maxPrice))}** (with 20% down)\n\nWant to browse properties or calculate for a specific one?`,
        newCtx: { state: "idle", monthlyIncome: incNum },
        actions: [
          { label: "Browse Properties", value: "browse properties", icon: Home },
          { label: "Calculate Mortgage", value: "calculate mortgage", icon: Calculator },
        ],
      };
    }
  }

  return {
    content: `I'm not sure I understood that. Let me help! You can:\n\n- Say **"buy a property"** to explore options\n- Say **"calculate mortgage"** to check eligibility\n- Say **"installment plan"** for payment plans\n- Say **"budget"** to find what you can afford\n- Or just type a **property price** and I'll guide you\n\nWhat would you like to do?`,
    newCtx: { state: "idle" },
    actions: MAIN_ACTIONS,
  };
}

// ─── Component ───────────────────────────────────────────────────
export default function JudeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [convoCtx, setConvoCtx] = useState<ConvoContext>({ state: "idle" });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: generateId(),
        role: "assistant",
        content: "Hi there! 👋 I'm **Jude**, your Atopary Properties assistant.\n\nI can help you buy a property, explore payment options, calculate mortgage eligibility, or apply for financing.\n\nWhat would you like to do?",
        timestamp: new Date(),
        actions: MAIN_ACTIONS,
      };
      setMessages([greeting]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 600));

    const response = processMessage(text, convoCtx);
    setConvoCtx(response.newCtx);

    const assistantMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      actions: response.actions,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.value);
  };

  const resetChat = () => {
    setMessages([]);
    setConvoCtx({ state: "idle" });
    setIsOpen(true);
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary-dark" target="_self">$1</a>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-dark transition-colors"
            aria-label="Open chat with Jude"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Jude</h3>
                  <p className="text-xs text-white/80">Atopary Helpdesk Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Reset chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Jude</span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-white text-secondary border border-gray-100 rounded-bl-md shadow-sm"
                      }`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                    {/* Quick Actions */}
                    {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickAction(action)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-secondary rounded-full hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
                          >
                            {action.icon && <action.icon className="w-3 h-3" />}
                            {action.label}
                            <ChevronRight className="w-3 h-3 opacity-50" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Jude</span>
                    </div>
                    <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <p className="text-center text-[10px] text-gray-400 mt-2">
                Powered by Atopary Properties
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
