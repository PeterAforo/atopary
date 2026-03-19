import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const city = searchParams.get("city") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || "APPROVED";

    const where: any = {};

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          seller: { select: { id: true, name: true, avatar: true } },
          _count: { select: { inquiries: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Properties fetch error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      address,
      city,
      state,
      zipCode,
      country,
      type,
      bedrooms,
      bathrooms,
      area,
      yearBuilt,
      parking,
      furnished,
      features,
      virtualTour,
      images,
      videos,
    } = body;

    let slug = slugify(title);
    const existingSlug = await prisma.property.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const property = await prisma.property.create({
      data: {
        title,
        slug,
        description,
        price: parseFloat(price),
        address,
        city,
        state,
        zipCode,
        country: country || "Ghana",
        type,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        area: parseFloat(area),
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        parking: parseInt(parking) || 0,
        furnished: Boolean(furnished),
        features: features || [],
        virtualTour: virtualTour || null,
        sellerId: session.user.id,
        status: session.user.role === "ADMIN" ? "APPROVED" : "PENDING",
        images: images?.length
          ? {
              create: images.map((img: any, index: number) => ({
                url: img.url,
                alt: img.alt || title,
                isPrimary: index === 0,
                order: index,
              })),
            }
          : undefined,
        videos: videos?.length
          ? {
              create: videos.map((vid: any) => ({
                url: vid.url,
                title: vid.title || "",
                isVirtual: vid.isVirtual || false,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        videos: true,
        seller: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    logger.error("Property creation error", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
