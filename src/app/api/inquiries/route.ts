import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";
import logger from "@/lib/logger";

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

    const where: Record<string, unknown> = {};

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
    logger.error("Inquiries fetch error", error);
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
        message: sanitizeText(message),
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
    logger.error("Inquiry creation error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Bulk actions on inquiries (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body as { ids: string[]; action: string };

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    switch (action) {
      case "in_progress":
        await prisma.inquiry.updateMany({ where: { id: { in: ids } }, data: { status: "IN_PROGRESS" } });
        break;
      case "responded":
        await prisma.inquiry.updateMany({ where: { id: { in: ids } }, data: { status: "RESPONDED" } });
        break;
      case "closed":
        await prisma.inquiry.updateMany({ where: { id: { in: ids } }, data: { status: "CLOSED" } });
        break;
      case "delete":
        await prisma.inquiry.deleteMany({ where: { id: { in: ids } } });
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ message: `Bulk ${action} completed on ${ids.length} inquiries` });
  } catch (error) {
    logger.error("Bulk inquiry action error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
