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
    update: { emailVerified: new Date() },
    create: {
      name: "Atopary Admin",
      email: "admin@atopary.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "+233201234567",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create Seller User
  const sellerPassword = await bcrypt.hash("seller123", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@atopary.com" },
    update: { emailVerified: new Date() },
    create: {
      name: "Kwame Properties",
      email: "seller@atopary.com",
      password: sellerPassword,
      role: "SELLER",
      phone: "+233209876543",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Seller user created:", seller.email);

  // Create Buyer User
  const buyerPassword = await bcrypt.hash("buyer123", 12);
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@atopary.com" },
    update: { emailVerified: new Date() },
    create: {
      name: "Ama Mensah",
      email: "buyer@atopary.com",
      password: buyerPassword,
      role: "BUYER",
      phone: "+233205551234",
      emailVerified: new Date(),
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

  // ─── Site Settings ──────────────────────────────────────────
  const settings = [
    { key: "site_name", value: "Atopary Properties", description: "Website name displayed in header and emails" },
    { key: "site_tagline", value: "Ghana's Premier Real Estate Platform", description: "Tagline shown on homepage hero" },
    { key: "site_description", value: "Discover luxury properties, homes, and commercial spaces across Ghana. Atopary Properties - Your trusted real estate partner.", description: "Default meta description" },
    { key: "contact_email", value: "info@atopary.com", description: "Main contact email address" },
    { key: "contact_phone", value: "+233 20 123 4567", description: "Main contact phone number" },
    { key: "contact_phone_2", value: "+233 30 987 6543", description: "Secondary phone number" },
    { key: "office_address", value: "14 Independence Avenue, Accra, Ghana", description: "Physical office address" },
    { key: "office_hours", value: "Monday - Saturday, 8:00 AM - 6:00 PM GMT", description: "Office working hours" },
    { key: "facebook_url", value: "https://facebook.com/atopary", description: "Facebook page URL" },
    { key: "instagram_url", value: "https://instagram.com/atopary", description: "Instagram profile URL" },
    { key: "twitter_url", value: "https://twitter.com/atopary", description: "Twitter/X profile URL" },
    { key: "linkedin_url", value: "https://linkedin.com/company/atopary", description: "LinkedIn company URL" },
    { key: "youtube_url", value: "https://youtube.com/@atopary", description: "YouTube channel URL" },
    { key: "whatsapp_number", value: "+233201234567", description: "WhatsApp business number" },
    { key: "currency", value: "GH₵", description: "Default currency symbol" },
    { key: "currency_code", value: "GHS", description: "ISO currency code" },
    { key: "hero_title_1", value: "Discover Your", description: "Hero section title line 1" },
    { key: "hero_title_2", value: "Perfect Property", description: "Hero section title line 2" },
    { key: "hero_subtitle", value: "From luxury homes to commercial spaces, Atopary Properties connects you with the finest real estate opportunities across Ghana. Buy, sell, or invest with confidence.", description: "Hero section subtitle text" },
    { key: "hero_image", value: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80", description: "Hero background image URL" },
    { key: "stats_properties", value: "500+", description: "Homepage stat: Properties Listed" },
    { key: "stats_clients", value: "200+", description: "Homepage stat: Happy Clients" },
    { key: "stats_cities", value: "50+", description: "Homepage stat: Cities Covered" },
    { key: "stats_satisfaction", value: "98%", description: "Homepage stat: Satisfaction Rate" },
    { key: "mortgage_min_rate", value: "18", description: "Minimum mortgage interest rate (%)" },
    { key: "mortgage_max_rate", value: "24", description: "Maximum mortgage interest rate (%)" },
    { key: "mortgage_max_term", value: "25", description: "Maximum mortgage term in years" },
    { key: "mortgage_max_ltv", value: "80", description: "Maximum loan-to-value ratio (%)" },
    { key: "installment_min_deposit", value: "30", description: "Minimum installment deposit (%)" },
    { key: "installment_max_months", value: "24", description: "Maximum installment duration (months)" },
    { key: "footer_text", value: "© 2025 Atopary Properties. All rights reserved.", description: "Footer copyright text" },
    { key: "about_mission", value: "To make property ownership accessible to every Ghanaian through transparent, professional, and technology-driven real estate services.", description: "Company mission statement" },
    { key: "about_vision", value: "To be Ghana's most trusted and innovative real estate platform, transforming how properties are bought, sold, and managed.", description: "Company vision statement" },
  ];

  for (const s of settings) {
    const existing = await prisma.siteSettings.findUnique({ where: { key: s.key } });
    if (!existing) {
      await prisma.siteSettings.create({ data: s });
    }
  }
  console.log("✅ Site settings seeded");

  // ─── CMS Sections ─────────────────────────────────────────
  const cmsSections = [
    {
      key: "hero",
      title: "Find Your Dream Home in Ghana",
      subtitle: "Ghana's Premier Real Estate Platform",
      content: "From luxury homes to commercial spaces, Atopary Properties connects you with the finest real estate opportunities across Ghana.",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2075&auto=format&fit=crop",
      order: 1,
      isActive: true,
    },
    {
      key: "featured_properties",
      title: "Featured Properties",
      subtitle: "Handpicked premium listings across Ghana",
      content: "Explore our curated selection of the finest properties available. Each listing is verified and presented with detailed information to help you make the right choice.",
      order: 2,
      isActive: true,
    },
    {
      key: "services",
      title: "Our Services",
      subtitle: "Comprehensive real estate solutions",
      content: JSON.stringify([
        { title: "Property Sales", description: "Buy or sell properties with professional guidance and secure transactions.", icon: "Home" },
        { title: "Mortgage Assistance", description: "Get help securing the best mortgage rates from our partner banks.", icon: "Calculator" },
        { title: "Property Valuation", description: "Accurate property valuations by certified professionals.", icon: "TrendingUp" },
        { title: "Investment Advisory", description: "Expert advice on real estate investment opportunities in Ghana.", icon: "BarChart" },
        { title: "Legal Support", description: "Complete legal documentation and title verification services.", icon: "Shield" },
        { title: "Property Management", description: "Professional management for rental and commercial properties.", icon: "Building" },
      ]),
      order: 3,
      isActive: true,
    },
    {
      key: "how_it_works",
      title: "How It Works",
      subtitle: "Simple steps to your dream property",
      content: JSON.stringify([
        { step: 1, title: "Search & Discover", description: "Browse our verified listings and find properties that match your criteria." },
        { step: 2, title: "Send an Inquiry", description: "Contact us through the property page. All communications are handled by Atopary." },
        { step: 3, title: "Schedule a Visit", description: "Our team arranges property inspections at your convenience." },
        { step: 4, title: "Secure Your Property", description: "Choose your payment option and complete the transaction with our support." },
      ]),
      order: 4,
      isActive: true,
    },
    {
      key: "testimonials",
      title: "What Our Clients Say",
      subtitle: "Real stories from satisfied customers",
      content: "Don't just take our word for it. Hear from property buyers and sellers who have used Atopary Properties.",
      order: 5,
      isActive: true,
    },
    {
      key: "cta",
      title: "Ready to Find Your Dream Property?",
      subtitle: "Start your journey today",
      content: "Join thousands of satisfied clients who found their perfect property through Atopary. Whether you're buying, selling, or investing, we're here to help.",
      order: 6,
      isActive: true,
    },
    {
      key: "about_hero",
      title: "About Atopary Properties",
      subtitle: "Ghana's Trusted Real Estate Partner Since 2020",
      content: "Atopary Properties was founded with a simple mission: to make property ownership accessible to every Ghanaian. We combine technology with local expertise to deliver a seamless real estate experience.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop",
      order: 10,
      isActive: true,
    },
    {
      key: "about_values",
      title: "Our Values",
      subtitle: "What drives us every day",
      content: JSON.stringify([
        { title: "Transparency", description: "We believe in honest, upfront communication. No hidden fees, no surprises." },
        { title: "Integrity", description: "Every property is verified. Every transaction is secure and documented." },
        { title: "Innovation", description: "We leverage technology to make buying and selling properties easier." },
        { title: "Customer First", description: "Your satisfaction is our top priority. We go above and beyond." },
      ]),
      order: 11,
      isActive: true,
    },
    {
      key: "contact_info",
      title: "Get In Touch",
      subtitle: "We'd love to hear from you",
      content: "Whether you have a question about a property, need mortgage advice, or want to list your property, our team is ready to help.",
      order: 20,
      isActive: true,
    },
  ];

  for (const section of cmsSections) {
    const existing = await prisma.cMSSection.findUnique({ where: { key: section.key } });
    if (!existing) {
      await prisma.cMSSection.create({ data: section });
    }
  }
  console.log("✅ CMS sections seeded");

  // ─── CMS Pages ────────────────────────────────────────────
  const cmsPages = [
    {
      title: "About Us",
      slug: "about",
      content: `<h2>About Atopary Properties</h2>
<p>Atopary Properties is Ghana's premier real estate platform, connecting property buyers with verified listings and handling all transactions professionally on behalf of both parties.</p>

<h3>Our Mission</h3>
<p>To make property ownership accessible to every Ghanaian through transparent, professional, and technology-driven real estate services.</p>

<h3>Our Vision</h3>
<p>To be Ghana's most trusted and innovative real estate platform, transforming how properties are bought, sold, and managed.</p>

<h3>What We Offer</h3>
<ul>
<li>Verified property listings across Ghana</li>
<li>Secure buyer-seller transactions</li>
<li>Mortgage and installment payment assistance</li>
<li>Property valuations and legal support</li>
<li>Professional property management</li>
</ul>

<h3>Our Team</h3>
<p>Our team comprises experienced real estate professionals, technology experts, and customer service specialists dedicated to making your property journey smooth and successful.</p>`,
      metaTitle: "About Us | Atopary Properties",
      metaDesc: "Learn about Atopary Properties - Ghana's trusted real estate platform offering property sales, mortgage assistance, and investment advisory.",
      isPublished: true,
    },
    {
      title: "Terms of Service",
      slug: "terms-of-service",
      content: `<h2>Terms of Service</h2>
<p>Last updated: January 2025</p>

<h3>1. Acceptance of Terms</h3>
<p>By accessing and using Atopary Properties website and services, you agree to be bound by these Terms of Service.</p>

<h3>2. Services</h3>
<p>Atopary Properties provides an online platform for property listings, buyer-seller mediation, mortgage assistance, and related real estate services in Ghana.</p>

<h3>3. User Accounts</h3>
<p>Users must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials.</p>

<h3>4. Property Listings</h3>
<p>All property listings are subject to verification by Atopary. We reserve the right to remove any listing that violates our policies.</p>

<h3>5. Communications</h3>
<p>All buyer-seller communications are mediated by Atopary Properties. Direct contact between buyers and sellers is not facilitated through our platform.</p>

<h3>6. Limitation of Liability</h3>
<p>Atopary Properties acts as a mediator and is not responsible for the condition of properties listed on the platform.</p>`,
      metaTitle: "Terms of Service | Atopary Properties",
      metaDesc: "Read the Terms of Service for Atopary Properties platform.",
      isPublished: true,
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: `<h2>Privacy Policy</h2>
<p>Last updated: January 2025</p>

<h3>1. Information We Collect</h3>
<p>We collect personal information including name, email, phone number, and property preferences when you register or submit inquiries.</p>

<h3>2. How We Use Your Information</h3>
<p>Your information is used to facilitate property transactions, send relevant notifications, and improve our services.</p>

<h3>3. Data Security</h3>
<p>We implement industry-standard security measures to protect your personal information.</p>

<h3>4. Third Parties</h3>
<p>We do not sell your personal information. We may share relevant details with our partner banks for mortgage applications with your consent.</p>

<h3>5. Contact</h3>
<p>For privacy-related inquiries, contact us at privacy@atopary.com.</p>`,
      metaTitle: "Privacy Policy | Atopary Properties",
      metaDesc: "Atopary Properties privacy policy - how we collect, use, and protect your personal information.",
      isPublished: true,
    },
    {
      title: "FAQ",
      slug: "faq",
      content: `<h2>Frequently Asked Questions</h2>

<h3>How do I buy a property through Atopary?</h3>
<p>Browse our listings, send an inquiry through the property page, and our team will guide you through the entire process including inspection, documentation, and payment.</p>

<h3>What payment options are available?</h3>
<p>We offer three options: Outright Payment (full price), Installment Plans (30% deposit, balance over 6-24 months), and Mortgage Facility (finance up to 80% through partner banks).</p>

<h3>How do I check my mortgage eligibility?</h3>
<p>Use our Mortgage Calculator on any property page, or chat with Jude, our AI assistant, who can calculate your eligibility instantly.</p>

<h3>Can I contact the seller directly?</h3>
<p>No. All communications between buyers and sellers are handled by Atopary to ensure safety and professionalism.</p>

<h3>How do I list my property?</h3>
<p>Register as a Seller, then use your dashboard to add property details, images, and pricing. Our team will verify and approve your listing.</p>

<h3>Is there a listing fee?</h3>
<p>Contact our team for current pricing on property listings and services.</p>`,
      metaTitle: "FAQ | Atopary Properties",
      metaDesc: "Find answers to frequently asked questions about buying, selling, and financing properties with Atopary.",
      isPublished: true,
    },
  ];

  for (const page of cmsPages) {
    const existing = await prisma.cMSPage.findUnique({ where: { slug: page.slug } });
    if (!existing) {
      await prisma.cMSPage.create({ data: page });
      console.log(`✅ CMS page created: ${page.title}`);
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
