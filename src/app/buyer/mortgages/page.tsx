"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calculator, Loader2, Building2, ChevronDown, ChevronUp,
  DollarSign, Clock, CheckCircle, XCircle,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default function BuyerMortgagesPage() {
  const [mortgages, setMortgages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMortgages = async () => {
      try {
        const res = await fetch("/api/mortgage");
        if (res.ok) {
          const data = await res.json();
          setMortgages(data.applications || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMortgages();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "REJECTED": return <XCircle className="w-5 h-5 text-red-500" />;
      case "UNDER_REVIEW": return <Clock className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary">Mortgage Applications</h2>
        <p className="text-sm text-muted-foreground">Track the status of your mortgage applications</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : mortgages.length === 0 ? (
        <div className="bg-white rounded-xl border border-border text-center py-20">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No mortgage applications yet</p>
          <Link href="/properties" className="text-sm text-primary hover:underline mt-2 inline-block">
            Browse properties to apply for mortgage
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mortgages.map((mortgage: any) => (
            <motion.div
              key={mortgage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === mortgage.id ? null : mortgage.id)}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(mortgage.status)}
                  <div>
                    <p className="text-sm font-semibold text-secondary">
                      Loan: {formatCurrency(mortgage.loanAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mortgage.property?.title || "General Application"} · {formatDate(mortgage.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusColor(mortgage.status)}`}>
                    {mortgage.status}
                  </span>
                  {expandedId === mortgage.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expandedId === mortgage.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border"
                >
                  <div className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: "Loan Amount", value: formatCurrency(mortgage.loanAmount) },
                        { label: "Down Payment", value: formatCurrency(mortgage.downPayment) },
                        { label: "Monthly Payment", value: mortgage.monthlyPayment ? formatCurrency(mortgage.monthlyPayment) : "N/A" },
                        { label: "Loan Term", value: `${mortgage.loanTermYears} years` },
                        { label: "Monthly Income", value: formatCurrency(mortgage.monthlyIncome) },
                        { label: "Employer", value: mortgage.employerName || "N/A" },
                        { label: "Job Title", value: mortgage.jobTitle || "N/A" },
                        { label: "Applied", value: formatDate(mortgage.createdAt) },
                      ].map((item, i) => (
                        <div key={i} className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-semibold text-secondary">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {mortgage.adminNotes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Admin Notes</p>
                        <p className="text-sm text-blue-800">{mortgage.adminNotes}</p>
                      </div>
                    )}

                    {mortgage.property && (
                      <Link href={`/properties/${mortgage.property.slug}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4">
                        <Building2 className="w-3 h-3" /> View Property →
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
