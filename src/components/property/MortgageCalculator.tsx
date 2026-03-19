"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import { calculateMortgage, checkMortgageEligibility, formatCurrency } from "@/lib/utils";

interface MortgageCalculatorProps {
  propertyPrice: number;
  propertyId?: string;
}

export default function MortgageCalculator({ propertyPrice, propertyId }: MortgageCalculatorProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"calculate" | "result" | "apply">("calculate");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const [formData, setFormData] = useState({
    downPayment: Math.round(propertyPrice * 0.2),
    interestRate: 18,
    loanTermYears: 20,
    monthlyIncome: 0,
  });

  const [applicationData, setApplicationData] = useState({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    dateOfBirth: "",
    nationalId: "",
    address: "",
    employerName: "",
    jobTitle: "",
    employmentYears: "",
    notes: "",
  });

  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    eligible: boolean;
    dtiRatio: number;
    maxPayment: number;
    loanAmount: number;
  } | null>(null);

  const handleCalculate = () => {
    const loanAmount = propertyPrice - formData.downPayment;
    const mortgage = calculateMortgage(loanAmount, formData.interestRate, formData.loanTermYears);
    const eligibility = checkMortgageEligibility(formData.monthlyIncome, mortgage.monthlyPayment);

    setResult({
      ...mortgage,
      ...eligibility,
      loanAmount,
    });
    setStep("result");
  };

  const handleApply = async () => {
    if (!session) {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setApplying(true);
    try {
      const res = await fetch("/api/mortgage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...applicationData,
          monthlyIncome: formData.monthlyIncome,
          loanAmount: result?.loanAmount,
          loanTermYears: formData.loanTermYears,
          downPayment: formData.downPayment,
          propertyId,
        }),
      });

      if (res.ok) {
        setApplied(true);
      }
    } catch (error) {
      console.error("Error applying for mortgage:", error);
    } finally {
      setApplying(false);
    }
  };

  if (applied) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 rounded-2xl p-8 text-center border border-green-200"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-700">Application Submitted!</h3>
        <p className="mt-2 text-green-600">
          Your mortgage application has been received. Our team will review it and get back to you within 48 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Steps Header */}
      <div className="flex border-b border-gray-100">
        {["Calculate", "Results", "Apply"].map((label, i) => {
          const stepKey = ["calculate", "result", "apply"][i];
          const isActive = step === stepKey;
          const isPast = ["calculate", "result", "apply"].indexOf(step) > i;
          return (
            <div
              key={label}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-white" : isPast ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Calculator */}
          {step === "calculate" && (
            <motion.div
              key="calculate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <span className="text-sm text-muted-foreground">Property Price</span>
                <span className="text-xl font-bold text-secondary">{formatCurrency(propertyPrice)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Down Payment</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-secondary text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((formData.downPayment / propertyPrice) * 100)}% of property price
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Interest Rate (%)</label>
                <div className="relative">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-secondary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Loan Term (Years)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.loanTermYears}
                    onChange={(e) => setFormData({ ...formData, loanTermYears: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-secondary text-sm appearance-none"
                  >
                    {[5, 10, 15, 20, 25, 30].map((y) => (
                      <option key={y} value={y}>{y} years</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Monthly Income</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.monthlyIncome || ""}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                    placeholder="Enter your monthly income"
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-secondary text-sm"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCalculate}
                disabled={!formData.monthlyIncome}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Calculator className="w-4 h-4" />
                Calculate Mortgage
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Eligibility Badge */}
              <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${
                result.eligible ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}>
                {result.eligible ? (
                  <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <h4 className={`font-bold ${result.eligible ? "text-green-700" : "text-red-700"}`}>
                    {result.eligible ? "You're Eligible!" : "Not Eligible"}
                  </h4>
                  <p className={`text-sm ${result.eligible ? "text-green-600" : "text-red-600"}`}>
                    Your debt-to-income ratio is {result.dtiRatio}%{" "}
                    {result.eligible ? "(below 40% threshold)" : "(exceeds 40% threshold)"}
                  </p>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Loan Amount", value: formatCurrency(result.loanAmount), color: "text-secondary" },
                  { label: "Monthly Payment", value: formatCurrency(result.monthlyPayment), color: "text-primary" },
                  { label: "Total Payment", value: formatCurrency(result.totalPayment), color: "text-secondary" },
                  { label: "Total Interest", value: formatCurrency(result.totalInterest), color: "text-orange-600" },
                  { label: "Max Affordable Payment", value: formatCurrency(result.maxPayment), color: "text-green-600" },
                  { label: "DTI Ratio", value: `${result.dtiRatio}%`, color: result.eligible ? "text-green-600" : "text-red-600" },
                ].map((item, i) => (
                  <div key={i} className="bg-muted rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("calculate")}
                  className="flex-1 py-3 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Recalculate
                </button>
                {result.eligible && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("apply")}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Apply */}
          {step === "apply" && (
            <motion.div
              key="apply"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Mortgage Application
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={applicationData.fullName}
                    onChange={(e) => setApplicationData({ ...applicationData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Email *</label>
                  <input
                    type="email"
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={applicationData.dateOfBirth}
                    onChange={(e) => setApplicationData({ ...applicationData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">National ID</label>
                  <input
                    type="text"
                    value={applicationData.nationalId}
                    onChange={(e) => setApplicationData({ ...applicationData, nationalId: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Address *</label>
                  <input
                    type="text"
                    value={applicationData.address}
                    onChange={(e) => setApplicationData({ ...applicationData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Employer Name</label>
                  <input
                    type="text"
                    value={applicationData.employerName}
                    onChange={(e) => setApplicationData({ ...applicationData, employerName: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Job Title</label>
                  <input
                    type="text"
                    value={applicationData.jobTitle}
                    onChange={(e) => setApplicationData({ ...applicationData, jobTitle: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Employment Years</label>
                  <input
                    type="number"
                    value={applicationData.employmentYears}
                    onChange={(e) => setApplicationData({ ...applicationData, employmentYears: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Additional Notes</label>
                <textarea
                  value={applicationData.notes}
                  onChange={(e) => setApplicationData({ ...applicationData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("result")}
                  className="flex-1 py-3 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApply}
                  disabled={applying || !applicationData.fullName || !applicationData.email || !applicationData.phone || !applicationData.address}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
