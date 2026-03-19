import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const where: any = {};

    if (session.user.role === "BUYER") {
      where.buyerId = session.user.id;
    } else if (session.user.role === "SELLER") {
      where.property = { sellerId: session.user.id };
    }

    if (status) where.status = status;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, email: true, phone: true } },
          property: {
            select: { id: true, title: true, slug: true, price: true },
            include: { images: { take: 1 } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Inquiries fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, propertyId } = await request.json();

    if (!message || !propertyId) {
      return NextResponse.json(
        { error: "Message and property ID are required" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        message,
        buyerId: session.user.id,
        propertyId,
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error("Inquiry creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
