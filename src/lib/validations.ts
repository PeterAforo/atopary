import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.enum(["BUYER", "SELLER"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().positive("Price must be positive"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Region is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().default("Ghana"),
  type: z.enum(["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "VILLA", "LAND", "COMMERCIAL", "OFFICE"]),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area: z.number().positive("Area must be positive"),
  yearBuilt: z.number().int().optional(),
  parking: z.number().int().min(0).default(0),
  furnished: z.boolean().default(false),
  features: z.array(z.string()).default([]),
  virtualTour: z.string().url().optional().or(z.literal("")),
});

export const inquirySchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
  propertyId: z.string(),
});

export const mortgageCalculatorSchema = z.object({
  propertyPrice: z.number().positive(),
  downPayment: z.number().min(0),
  interestRate: z.number().positive(),
  loanTermYears: z.number().int().positive(),
  monthlyIncome: z.number().positive(),
});

export const mortgageApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.string().optional(),
  nationalId: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.number().positive("Monthly income is required"),
  employmentYears: z.number().int().optional(),
  loanAmount: z.number().positive("Loan amount is required"),
  loanTermYears: z.number().int().positive("Loan term is required"),
  downPayment: z.number().min(0, "Down payment is required"),
  propertyId: z.string().optional(),
  notes: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type MortgageCalculatorInput = z.infer<typeof mortgageCalculatorSchema>;
export type MortgageApplicationInput = z.infer<typeof mortgageApplicationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
