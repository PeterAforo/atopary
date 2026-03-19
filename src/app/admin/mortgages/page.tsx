"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calculator, Loader2, Building2, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Clock, Save,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default function AdminMortgagesPage() {
  const [mortgages, setMortgages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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

  useEffect(() => { fetchMortgages(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/mortgage/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMortgages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUpdating(null);
    }
  };

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
        <p className="text-sm text-muted-foreground">Review and manage all mortgage applications</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : mortgages.length === 0 ? (
        <div className="bg-white rounded-xl border border-border text-center py-20">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No mortgage applications yet</p>
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
                      {mortgage.fullName} — {formatCurrency(mortgage.loanAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mortgage.property?.title || "General"} · {formatDate(mortgage.createdAt)}
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
                  <div className="p-5 space-y-5">
                    {/* Personal Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Personal Information</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Full Name", value: mortgage.fullName },
                          { label: "Email", value: mortgage.email },
                          { label: "Phone", value: mortgage.phone },
                          { label: "Address", value: mortgage.address },
                          { label: "National ID", value: mortgage.nationalId || "N/A" },
                          { label: "Date of Birth", value: mortgage.dateOfBirth ? formatDate(mortgage.dateOfBirth) : "N/A" },
                        ].map((item, i) => (
                          <div key={i} className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className="text-sm font-medium text-secondary truncate">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Employment */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Employment</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Employer", value: mortgage.employerName || "N/A" },
                          { label: "Job Title", value: mortgage.jobTitle || "N/A" },
                          { label: "Monthly Income", value: formatCurrency(mortgage.monthlyIncome) },
                          { label: "Years Employed", value: mortgage.employmentYears || "N/A" },
                        ].map((item, i) => (
                          <div key={i} className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className="text-sm font-medium text-secondary">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Loan Details */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Loan Details</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Loan Amount", value: formatCurrency(mortgage.loanAmount) },
                          { label: "Down Payment", value: formatCurrency(mortgage.downPayment) },
                          { label: "Loan Term", value: `${mortgage.loanTermYears} years` },
                          { label: "Monthly Payment", value: mortgage.monthlyPayment ? formatCurrency(mortgage.monthlyPayment) : "N/A" },
                        ].map((item, i) => (
                          <div key={i} className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className="text-sm font-medium text-secondary">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {mortgage.notes && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Applicant Notes</p>
                        <p className="text-sm text-yellow-800">{mortgage.notes}</p>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-border">
                      <span className="text-sm font-medium text-secondary mr-2">Change Status:</span>
                      {["UNDER_REVIEW", "APPROVED", "REJECTED"].map((status) => (
                        <motion.button
                          key={status}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStatusChange(mortgage.id, status)}
                          disabled={updating === mortgage.id || mortgage.status === status}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                            status === "APPROVED" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                            status === "REJECTED" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                            "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                        >
                          {updating === mortgage.id ? <Loader2 className="w-3 h-3 animate-spin" /> : status.replace("_", " ")}
                        </motion.button>
                      ))}
                    </div>
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
