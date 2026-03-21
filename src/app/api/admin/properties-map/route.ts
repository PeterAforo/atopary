import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        city: true,
        state: true,
        type: true,
        status: true,
        latitude: true,
        longitude: true,
        bedrooms: true,
        bathrooms: true,
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    logger.error("Properties map fetch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
