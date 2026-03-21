import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        images: { orderBy: { order: "asc" } },
        videos: true,
        seller: {
          select: { id: true, name: true },
        },
        _count: { select: { inquiries: true } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    await prisma.property.update({
      where: { id: property.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(property);
  } catch (error) {
    logger.error("Property fetch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && property.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const allowedFields = [
      "title", "description", "price", "address", "city", "state", "zipCode",
      "country", "type", "status", "bedrooms", "bathrooms", "area", "yearBuilt",
      "parking", "furnished", "features", "virtualTour", "isFeatured",
      "latitude", "longitude",
    ];
    const data: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }
    // Only admins can change status and isFeatured
    if (session.user.role !== "ADMIN") {
      delete data.status;
      delete data.isFeatured;
    }

    const updated = await prisma.property.update({
      where: { id },
      data,
      include: { images: true, videos: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Property update error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && property.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ message: "Property deleted" });
  } catch (error) {
    logger.error("Property delete error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
