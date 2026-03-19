import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@atopary.com" },
    update: {},
    create: {
      name: "Atopary Admin",
      email: "admin@atopary.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "+233201234567",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create Seller User
  const sellerPassword = await bcrypt.hash("seller123", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@atopary.com" },
    update: {},
    create: {
      name: "Kwame Properties",
      email: "seller@atopary.com",
      password: sellerPassword,
      role: "SELLER",
      phone: "+233209876543",
    },
  });
  console.log("✅ Seller user created:", seller.email);

  // Create Buyer User
  const buyerPassword = await bcrypt.hash("buyer123", 12);
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@atopary.com" },
    update: {},
    create: {
      name: "Ama Mensah",
      email: "buyer@atopary.com",
      password: buyerPassword,
      role: "BUYER",
      phone: "+233205551234",
    },
  });
  console.log("✅ Buyer user created:", buyer.email);

  // Create Sample Properties
  const properties = [
    {
      title: "Modern Villa in East Legon",
      slug: "modern-villa-east-legon",
      description:
        "A stunning modern villa located in the heart of East Legon, Accra. This 5-bedroom property features contemporary architecture, a swimming pool, landscaped gardens, and state-of-the-art smart home technology. Perfect for families seeking luxury living in one of Accra's most prestigious neighborhoods.\n\nThe property boasts spacious interiors with high ceilings, floor-to-ceiling windows that flood the rooms with natural light, and premium finishes throughout. The master suite includes a walk-in closet and en-suite bathroom with a jacuzzi tub.\n\nOutdoor amenities include a heated swimming pool, BBQ area, children's play area, and a 2-car garage with additional parking space.",
      price: 1500000,
      address: "14 Palm Avenue, East Legon",
      city: "Accra",
      state: "Greater Accra",
      zipCode: "00233",
      type: "VILLA" as const,
      bedrooms: 5,
      bathrooms: 4,
      area: 450,
      yearBuilt: 2023,
      parking: 3,
      furnished: true,
      features: ["Swimming Pool", "Garden", "Garage", "Security", "Air Conditioning", "Smart Home", "CCTV", "Generator", "Borehole"],
      status: "APPROVED" as const,
      isFeatured: true,
      sellerId: seller.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop", alt: "Villa Front View", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop", alt: "Villa Garden", order: 1 },
          { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop", alt: "Villa Interior", order: 2 },
        ],
      },
    },
    {
      title: "Luxury Apartment in Airport Residential",
      slug: "luxury-apartment-airport-residential",
      description:
        "Experience the pinnacle of urban living in this luxurious 3-bedroom apartment located in the prestigious Airport Residential Area. This modern apartment offers panoramic city views, premium finishes, and access to world-class amenities.\n\nThe open-plan living and dining area features imported Italian marble floors, a gourmet kitchen with top-of-the-line appliances, and a spacious balcony perfect for entertaining. Each bedroom comes with built-in wardrobes and en-suite bathrooms.",
      price: 850000,
      address: "7th Avenue, Airport Residential Area",
      city: "Accra",
      state: "Greater Accra",
      zipCode: "00233",
      type: "APARTMENT" as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      yearBuilt: 2022,
      parking: 2,
      furnished: true,
      features: ["Air Conditioning", "Elevator", "Security", "Gym", "Balcony", "CCTV", "Generator"],
      status: "APPROVED" as const,
      isFeatured: true,
      sellerId: seller.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop", alt: "Apartment View", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop", alt: "Apartment Interior", order: 1 },
        ],
      },
    },
    {
      title: "Executive House in Cantonments",
      slug: "executive-house-cantonments",
      description:
        "An exceptional 6-bedroom executive house in the heart of Cantonments, one of Accra's most sought-after neighborhoods. This property combines classic elegance with modern amenities, set on a large plot with mature trees and beautiful landscaping.\n\nThe house features a grand entrance hall, formal living and dining rooms, a modern kitchen, a home office, and a self-contained boys' quarters. The outdoor space includes a swimming pool, manicured gardens, and ample parking.",
      price: 2200000,
      address: "12 Switchback Road, Cantonments",
      city: "Accra",
      state: "Greater Accra",
      zipCode: "00233",
      type: "HOUSE" as const,
      bedrooms: 6,
      bathrooms: 5,
      area: 600,
      yearBuilt: 2021,
      parking: 4,
      furnished: false,
      features: ["Swimming Pool", "Garden", "Garage", "Security", "Air Conditioning", "CCTV", "Generator", "Borehole", "Boys Quarters", "Gate House"],
      status: "APPROVED" as const,
      isFeatured: true,
      sellerId: seller.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop", alt: "House Front", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop", alt: "House Garden", order: 1 },
        ],
      },
    },
    {
      title: "Beachfront Condo in Tema",
      slug: "beachfront-condo-tema",
      description:
        "Wake up to stunning ocean views in this beautiful 3-bedroom beachfront condo in Tema. This modern property offers direct beach access, a private balcony overlooking the sea, and top-quality interior finishes.\n\nThe community features a shared swimming pool, fitness center, 24-hour security, and landscaped gardens. Perfect for those who want a coastal lifestyle close to the city.",
      price: 650000,
      address: "Beach Road, Community 25",
      city: "Tema",
      state: "Greater Accra",
      zipCode: "00233",
      type: "CONDO" as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      yearBuilt: 2023,
      parking: 1,
      furnished: true,
      features: ["Swimming Pool", "Gym", "Security", "Air Conditioning", "Balcony", "CCTV"],
      status: "APPROVED" as const,
      isFeatured: true,
      sellerId: seller.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop", alt: "Condo View", isPrimary: true, order: 0 },
        ],
      },
    },
    {
      title: "Commercial Office Space in Osu",
      slug: "commercial-office-osu",
      description:
        "Prime commercial office space located on Oxford Street, Osu - Accra's vibrant commercial hub. This 1,200 sqm office building features open-plan floors, meeting rooms, a reception area, and underground parking.\n\nIdeal for corporate offices, co-working spaces, or financial institutions. The building comes with a backup generator, central air conditioning, fiber optic internet connectivity, and 24-hour security.",
      price: 3500000,
      address: "Oxford Street, Osu",
      city: "Accra",
      state: "Greater Accra",
      zipCode: "00233",
      type: "COMMERCIAL" as const,
      bedrooms: 0,
      bathrooms: 4,
      area: 1200,
      yearBuilt: 2020,
      parking: 20,
      furnished: false,
      features: ["Air Conditioning", "Elevator", "Security", "Generator", "CCTV", "Storage Room"],
      status: "APPROVED" as const,
      isFeatured: true,
      sellerId: seller.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop", alt: "Office Building", isPrimary: true, order: 0 },
        ],
      },
    },
    {
      title: "Modern Townhouse in Spintex",
      slug: "modern-townhouse-spintex",
      description:
        "A beautifully designed 4-bedroom townhouse in the Spintex area, offering modern living at an affordable price. This property features an open-plan ground floor, a fitted kitchen, and a private courtyard.\n\nThe gated community provides 24-hour security, landscaped common areas, and reliable water supply. Close to major shopping centers, schools, and hospitals.",
      price: 420000,
      address: "Spintex Road, Community 18",
      city: "Accra",
      state: "Greater Accra",
      zipCode: "00233",
      type: "TOWNHOUSE" as const,
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      yearBuilt: 2024,
      parking: 2,
      furnished: false,
      features: ["Garden", "Garage", "Security", "Air Conditioning", "Borehole"],
      status: "APPROVED" as const,
      isFeatured: true,
      sellerId: seller.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&auto=format&fit=crop", alt: "Townhouse", isPrimary: true, order: 0 },
        ],
      },
    },
    {
      title: "Residential Land in Kumasi",
      slug: "residential-land-kumasi",
      description:
        "A prime residential plot of land located in Kumasi, the second largest city in Ghana. This 1-acre plot is situated in a developing area with good road access, electricity, and water supply nearby.\n\nPerfect for building a family home or a small residential development. The land has clear title documentation and is free from all encumbrances.",
      price: 180000,
      address: "Ahodwo, Near Prempeh College",
      city: "Kumasi",
      state: "Ashanti",
      zipCode: "00233",
      type: "LAND" as const,
      bedrooms: 0,
      bathrooms: 0,
      area: 4047,
      parking: 0,
      furnished: false,
      features: [],
      status: "APPROVED" as const,
      isFeatured: false,
      sellerId: seller.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop", alt: "Land Plot", isPrimary: true, order: 0 },
        ],
      },
    },
    {
      title: "Pending Approval: New House in Tema",
      slug: "pending-house-tema",
      description:
        "A newly built 3-bedroom house in Tema, awaiting approval. This property features modern design, quality finishes, and a good location near schools and shopping centers.",
      price: 350000,
      address: "Community 20, Tema",
      city: "Tema",
      state: "Greater Accra",
      zipCode: "00233",
      type: "HOUSE" as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      yearBuilt: 2025,
      parking: 1,
      furnished: false,
      features: ["Security", "Borehole"],
      status: "PENDING" as const,
      isFeatured: false,
      sellerId: seller.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop", alt: "New House", isPrimary: true, order: 0 },
        ],
      },
    },
  ];

  for (const prop of properties) {
    const existing = await prisma.property.findUnique({ where: { slug: prop.slug } });
    if (!existing) {
      await prisma.property.create({ data: prop });
      console.log(`✅ Property created: ${prop.title}`);
    } else {
      console.log(`⏭️ Property exists: ${prop.title}`);
    }
  }

  // Create sample testimonials
  const testimonials = [
    { name: "Kwame Asante", role: "Property Buyer", content: "Atopary made finding our dream home an absolute breeze. The virtual tours saved us so much time, and the mortgage calculator helped us plan our finances perfectly.", rating: 5 },
    { name: "Ama Mensah", role: "Property Seller", content: "I listed my property and within weeks, Atopary connected me with serious buyers. The process was transparent, professional, and hassle-free.", rating: 5 },
    { name: "Joseph Owusu", role: "Real Estate Investor", content: "As an investor, I rely on Atopary for market insights and verified listings. Their platform has been instrumental in growing my property portfolio.", rating: 5 },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
      console.log(`✅ Testimonial created: ${t.name}`);
    }
  }

  console.log("\n🎉 Seeding completed!");
  console.log("\n📋 Login Credentials:");
  console.log("   Admin:  admin@atopary.com / admin123");
  console.log("   Seller: seller@atopary.com / seller123");
  console.log("   Buyer:  buyer@atopary.com / buyer123");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
