"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Loader2, Bot, User, Calculator,
  Home, CreditCard, HelpCircle, ChevronRight, RotateCcw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Buy a Property", value: "I want to buy a property", icon: Home },
  { label: "Payment Options", value: "What payment options do you offer?", icon: CreditCard },
  { label: "Mortgage Calculator", value: "Help me calculate mortgage eligibility", icon: Calculator },
  { label: "General Help", value: "I need help with something", icon: HelpCircle },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function calculateMortgage(price: number, downPaymentPct: number, rate: number, years: number) {
  const loanAmount = price * (1 - downPaymentPct / 100);
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return loanAmount / numPayments;
  const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  return payment;
}

function getJudeResponse(userMessage: string, conversationHistory: Message[]): { content: string; actions?: QuickAction[] } {
  const msg = userMessage.toLowerCase().trim();
  const historyLength = conversationHistory.filter(m => m.role === "user").length;

  // Greetings
  if (historyLength <= 1 && (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("good"))) {
    return {
      content: "Hello! 👋 Welcome to Atopary Properties. I'm **Jude**, your personal real estate assistant.\n\nI can help you with:\n- **Buying a property** (outright payment, installments, or mortgage)\n- **Mortgage eligibility** calculations\n- **Applying for a mortgage** facility\n- **General questions** about our services\n\nHow can I assist you today?",
      actions: QUICK_ACTIONS,
    };
  }

  // Buy a property
  if (msg.includes("buy") || msg.includes("purchase") || msg.includes("looking for") || msg.includes("want a property") || msg.includes("want to buy")) {
    return {
      content: "Great choice! 🏠 At Atopary Properties, we offer three convenient ways to purchase a property:\n\n**1. Outright Payment**\nPay the full price upfront and own your property immediately. This is the fastest route to ownership.\n\n**2. Installment Plan**\nWe offer flexible installment plans where you can spread your payments over 6–24 months. A minimum deposit of 30% is typically required.\n\n**3. Mortgage Facility**\nWe partner with leading banks in Ghana to help you secure a mortgage. You can finance up to 80% of the property value with repayment periods of up to 25 years.\n\nWhich option interests you?",
      actions: [
        { label: "Outright Payment", value: "Tell me about outright payment", icon: CreditCard },
        { label: "Installment Plan", value: "Tell me about installment plans", icon: CreditCard },
        { label: "Mortgage Facility", value: "Tell me about mortgage facility", icon: Calculator },
        { label: "Browse Properties", value: "Show me available properties", icon: Home },
      ],
    };
  }

  // Outright payment
  if (msg.includes("outright") || (msg.includes("full") && msg.includes("pay"))) {
    return {
      content: "**Outright Payment** 💰\n\nWith outright payment, you pay the full property price and receive immediate ownership transfer.\n\n**Benefits:**\n- No interest charges\n- Immediate property ownership\n- Fastest transaction process\n- Stronger negotiating position\n\n**Process:**\n1. Select your property on our platform\n2. Send an inquiry through Atopary\n3. Our team arranges property inspection\n4. Legal documentation and due diligence\n5. Payment and title transfer\n\nWould you like to browse our available properties, or do you have a specific budget in mind?",
      actions: [
        { label: "Browse Properties", value: "Show me available properties", icon: Home },
        { label: "Other Options", value: "What other payment options do you offer?", icon: CreditCard },
      ],
    };
  }

  // Installment plans
  if (msg.includes("installment") || msg.includes("instalment") || msg.includes("spread") || msg.includes("payment plan")) {
    return {
      content: "**Installment Payment Plans** 📋\n\nAtopary offers flexible installment plans to make property ownership more accessible.\n\n**Terms:**\n- **Minimum deposit:** 30% of property price\n- **Duration:** 6 to 24 months\n- **Interest:** Competitive rates apply (typically 5-10% per annum)\n- **Eligibility:** Valid ID, proof of income, and completed application\n\n**How it works:**\n1. Select your property and express interest\n2. Pay the initial deposit (minimum 30%)\n3. Sign the installment agreement with Atopary\n4. Make monthly payments as agreed\n5. Receive full ownership upon final payment\n\n**Example:** For a GH₵500,000 property:\n- Deposit: GH₵150,000 (30%)\n- Balance: GH₵350,000 over 12 months\n- Monthly payment: ~GH₵29,167 + interest\n\nWould you like to calculate installments for a specific property?",
      actions: [
        { label: "Calculate Installments", value: "Calculate installment for a property", icon: Calculator },
        { label: "Apply Now", value: "I want to apply for an installment plan", icon: CreditCard },
        { label: "Browse Properties", value: "Show me available properties", icon: Home },
      ],
    };
  }

  // Mortgage
  if (msg.includes("mortgage") || msg.includes("home loan") || msg.includes("bank loan") || msg.includes("finance") || msg.includes("loan")) {
    if (msg.includes("calculate") || msg.includes("eligib") || msg.includes("how much") || msg.includes("afford") || msg.includes("qualify")) {
      return {
        content: "**Mortgage Eligibility Calculator** 🧮\n\nLet me help you check your mortgage eligibility! I'll need a few details:\n\n**Please provide:**\n1. **Property price** (or budget)\n2. **Your monthly income** (gross)\n3. **Down payment** you can make (%)\n\nFor example, you can say:\n*\"Property price GH₵500,000, income GH₵8,000, 20% down payment\"*\n\nOr I can do a quick estimate — just tell me the **property price** and your **monthly income**.",
        actions: [
          { label: "Example: GH₵400K, GH₵6K income", value: "Property price 400000, income 6000, 20% down", icon: Calculator },
          { label: "Example: GH₵600K, GH₵10K income", value: "Property price 600000, income 10000, 20% down", icon: Calculator },
        ],
      };
    }

    return {
      content: "**Mortgage Facility** 🏦\n\nAtopary Properties partners with leading Ghanaian banks to help you secure a mortgage.\n\n**Key Features:**\n- Finance up to **80%** of property value\n- Repayment periods: **5 to 25 years**\n- Competitive interest rates: **18-24%** per annum\n- Open to salaried employees and self-employed\n\n**Requirements:**\n- Valid Ghana Card or passport\n- Proof of income (pay slips or financial statements)\n- Bank statements (last 6 months)\n- Employment letter or business registration\n- Minimum age: 21 years\n\n**Eligibility Rule:**\nYour monthly mortgage payment should not exceed **40%** of your gross monthly income (Debt-to-Income ratio).\n\nWould you like me to calculate your mortgage eligibility?",
      actions: [
        { label: "Calculate Eligibility", value: "Help me calculate mortgage eligibility", icon: Calculator },
        { label: "Apply for Mortgage", value: "I want to apply for a mortgage", icon: CreditCard },
        { label: "Browse Properties", value: "Show me available properties", icon: Home },
      ],
    };
  }

  // Mortgage calculation with numbers
  const priceMatch = msg.match(/(?:price|property|budget)[\s:]*(?:gh[₵c]?)?\s*([\d,]+)/i) || msg.match(/(\d{4,})/);
  const incomeMatch = msg.match(/(?:income|salary|earn)[\s:]*(?:gh[₵c]?)?\s*([\d,]+)/i) || (priceMatch ? msg.match(/(?:[\d,]+).*?(\d{3,})/g) : null);
  const downMatch = msg.match(/(\d{1,2})%?\s*(?:down|deposit)/i);

  if (priceMatch && msg.match(/\d/) && (msg.includes("income") || msg.includes("salary") || msg.includes("down") || msg.includes(",") || msg.includes("earn"))) {
    const numbers = msg.match(/[\d,]+/g)?.map(n => parseFloat(n.replace(/,/g, ""))) || [];
    if (numbers.length >= 2) {
      const price = Math.max(...numbers.slice(0, 1)) || numbers[0];
      const income = numbers.length > 1 ? numbers[1] : 0;
      const downPct = downMatch ? parseInt(downMatch[1]) : 20;
      const rate = 22; // average mortgage rate in Ghana
      const years = 20;

      const monthlyPayment = calculateMortgage(price, downPct, rate, years);
      const maxAffordable = income * 0.4;
      const isEligible = monthlyPayment <= maxAffordable;
      const downPayment = price * (downPct / 100);
      const loanAmount = price - downPayment;

      return {
        content: `**Mortgage Eligibility Result** 📊\n\n**Property Price:** ${formatCurrency(price)}\n**Down Payment (${downPct}%):** ${formatCurrency(downPayment)}\n**Loan Amount:** ${formatCurrency(loanAmount)}\n**Interest Rate:** ${rate}% per annum\n**Loan Term:** ${years} years\n\n---\n\n**Monthly Payment:** ${formatCurrency(Math.round(monthlyPayment))}\n**Your Monthly Income:** ${formatCurrency(income)}\n**Max Affordable (40% DTI):** ${formatCurrency(Math.round(maxAffordable))}\n\n---\n\n${isEligible
          ? `✅ **You are likely ELIGIBLE!**\nYour monthly payment of ${formatCurrency(Math.round(monthlyPayment))} is within your affordability limit of ${formatCurrency(Math.round(maxAffordable))}.`
          : `⚠️ **You may NOT qualify** at this loan amount.\nThe monthly payment of ${formatCurrency(Math.round(monthlyPayment))} exceeds your affordability limit of ${formatCurrency(Math.round(maxAffordable))}.\n\n**Suggestions:**\n- Increase your down payment\n- Consider a lower-priced property\n- Extend the loan term\n- Consider our installment plan instead`
        }\n\nWould you like to apply for a mortgage or adjust the calculation?`,
        actions: [
          { label: "Apply for Mortgage", value: "I want to apply for a mortgage", icon: CreditCard },
          { label: "Recalculate", value: "Help me calculate mortgage eligibility", icon: Calculator },
          { label: "Installment Plan", value: "Tell me about installment plans", icon: CreditCard },
        ],
      };
    }
  }

  // Apply for mortgage
  if (msg.includes("apply") && (msg.includes("mortgage") || msg.includes("loan"))) {
    return {
      content: "**Apply for a Mortgage** 📝\n\nTo apply for a mortgage through Atopary Properties:\n\n**Option 1: Online Application**\nVisit any property page on our website, scroll to the **Mortgage Calculator** section, calculate your eligibility, and click **\"Apply Now\"** to submit your application directly.\n\n**Option 2: Contact Our Team**\nSend us an inquiry through our **Contact page** or call us, and our mortgage specialists will guide you through the process.\n\n**What you'll need:**\n- Personal details (name, ID, date of birth)\n- Employment information\n- Monthly income proof\n- Property you're interested in\n\nThe application takes about 5 minutes to complete, and our team will follow up within 24-48 hours.\n\nWould you like me to guide you to a property to start your application?",
      actions: [
        { label: "Browse Properties", value: "Show me available properties", icon: Home },
        { label: "Contact Atopary", value: "How do I contact Atopary?", icon: HelpCircle },
      ],
    };
  }

  // Apply for installment
  if (msg.includes("apply") && msg.includes("installment")) {
    return {
      content: "**Apply for Installment Plan** 📝\n\nTo apply for an installment plan:\n\n1. **Browse** our properties and select one you like\n2. **Send an inquiry** through the property page\n3. In your message, mention that you'd like to use our **installment plan**\n4. Our team will contact you to discuss terms and arrange the deposit\n\nYou can also visit our **Contact page** to speak directly with our team.\n\nWould you like to browse available properties?",
      actions: [
        { label: "Browse Properties", value: "Show me available properties", icon: Home },
        { label: "Contact Atopary", value: "How do I contact Atopary?", icon: HelpCircle },
      ],
    };
  }

  // Show properties
  if (msg.includes("browse") || msg.includes("show me") || msg.includes("available") || msg.includes("properties") || msg.includes("listings")) {
    return {
      content: "🏘️ You can browse all our available properties on the **Properties page**.\n\nYou can filter by:\n- **Location** (Accra, Kumasi, etc.)\n- **Property type** (House, Apartment, Land, Commercial)\n- **Price range**\n- **Number of bedrooms**\n\n👉 [Browse Properties](/properties)\n\nOnce you find a property you like, send an inquiry and our team will assist you with the next steps!",
      actions: [
        { label: "Payment Options", value: "What payment options do you offer?", icon: CreditCard },
        { label: "Mortgage Calculator", value: "Help me calculate mortgage eligibility", icon: Calculator },
      ],
    };
  }

  // Contact
  if (msg.includes("contact") || msg.includes("phone") || msg.includes("email") || msg.includes("reach") || msg.includes("call")) {
    return {
      content: "**Contact Atopary Properties** 📞\n\n- **Phone:** +233 XX XXX XXXX\n- **Email:** info@atopary.com\n- **Office:** Accra, Ghana\n\nYou can also reach us through our **[Contact page](/contact)** where you can send us a message directly.\n\nOur team is available Monday to Saturday, 8:00 AM to 6:00 PM GMT.\n\nIs there anything else I can help you with?",
      actions: QUICK_ACTIONS,
    };
  }

  // Payment options
  if (msg.includes("payment") || msg.includes("options") || msg.includes("how to pay") || msg.includes("ways to pay")) {
    return {
      content: "**Payment Options at Atopary** 💳\n\nWe offer three flexible payment options:\n\n**1. Outright Payment** — Pay full price, own immediately\n**2. Installment Plan** — 30% deposit, pay balance over 6-24 months\n**3. Mortgage Facility** — Finance up to 80% through partner banks\n\nWhich option would you like to learn more about?",
      actions: [
        { label: "Outright Payment", value: "Tell me about outright payment", icon: CreditCard },
        { label: "Installment Plan", value: "Tell me about installment plans", icon: CreditCard },
        { label: "Mortgage Facility", value: "Tell me about mortgage facility", icon: Calculator },
      ],
    };
  }

  // About Atopary
  if (msg.includes("about") || msg.includes("who") || msg.includes("what is atopary") || msg.includes("what do you do")) {
    return {
      content: "**About Atopary Properties** 🏢\n\nAtopary Properties is Ghana's premier real estate platform. We connect property buyers with verified listings and handle all transactions on behalf of both parties.\n\n**What we do:**\n- List verified properties across Ghana\n- Facilitate secure property transactions\n- Offer mortgage assistance and installment plans\n- Provide property valuations\n- Handle all buyer-seller communications\n\n**Why choose us:**\n- All properties are verified\n- Transparent pricing, no hidden fees\n- Professional transaction management\n- Mortgage and financing support\n\nHow can I help you today?",
      actions: QUICK_ACTIONS,
    };
  }

  // Thank you
  if (msg.includes("thank") || msg.includes("thanks")) {
    return {
      content: "You're welcome! 😊 I'm glad I could help.\n\nIf you need anything else, don't hesitate to ask. Whether it's finding a property, calculating a mortgage, or understanding our payment options — I'm here for you!\n\nHave a wonderful day! 🏠",
      actions: QUICK_ACTIONS,
    };
  }

  // Default / fallback
  return {
    content: "I'd be happy to help! As Atopary's assistant, I can help you with:\n\n- **Buying a property** — outright, installments, or mortgage\n- **Mortgage eligibility** — calculate what you can afford\n- **Applying** for a mortgage or installment plan\n- **Browsing properties** available on our platform\n- **Contacting** our team\n\nCould you tell me more about what you're looking for?",
    actions: QUICK_ACTIONS,
  };
}

export default function JudeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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
      // Initial greeting
      const greeting: Message = {
        id: generateId(),
        role: "assistant",
        content: "Hi there! 👋 I'm **Jude**, your Atopary Properties assistant.\n\nI can help you buy a property, explore payment options, calculate mortgage eligibility, or apply for financing.\n\nWhat would you like to know?",
        timestamp: new Date(),
        actions: QUICK_ACTIONS,
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

    // Simulate typing delay for natural feel
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 800));

    const response = getJudeResponse(text, [...messages, userMsg]);

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
    setIsOpen(true);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for bold and links
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
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
