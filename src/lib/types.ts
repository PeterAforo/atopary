export interface PropertyImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  order: number;
  propertyId: string;
  createdAt: string;
}

export interface PropertyVideo {
  id: string;
  url: string;
  title: string | null;
  isVirtual: boolean;
  propertyId: string;
  createdAt: string;
}

export interface PropertySeller {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  yearBuilt: number | null;
  parking: number;
  furnished: boolean;
  features: string[];
  images: PropertyImage[];
  videos: PropertyVideo[];
  virtualTour: string | null;
  sellerId: string;
  seller?: PropertySeller;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    inquiries: number;
  };
}

export interface Inquiry {
  id: string;
  message: string;
  status: string;
  buyerId: string;
  propertyId: string;
  response: string | null;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  property?: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images?: PropertyImage[];
  };
}

export interface MortgageApplication {
  id: string;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  nationalId: string | null;
  address: string;
  employerName: string | null;
  jobTitle: string | null;
  monthlyIncome: number;
  employmentYears: number | null;
  loanAmount: number;
  loanTermYears: number;
  interestRate: number | null;
  downPayment: number;
  monthlyPayment: number | null;
  propertyId: string | null;
  buyerId: string;
  documents: string[];
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    slug: string;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "ADMIN" | "SELLER" | "BUYER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
