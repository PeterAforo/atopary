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

    const [
      totalProperties,
      pendingProperties,
      totalUsers,
      totalInquiries,
      totalMortgages,
      pendingMortgages,
      recentProperties,
      recentInquiries,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.inquiry.count(),
      prisma.mortgageApplication.count(),
      prisma.mortgageApplication.count({ where: { status: "PENDING" } }),
      prisma.property.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, city: true, price: true, status: true, createdAt: true },
      }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          buyer: { select: { id: true, name: true } },
          property: { select: { id: true, title: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalProperties,
      pendingProperties,
      totalUsers,
      totalInquiries,
      totalMortgages,
      pendingMortgages,
      recentProperties,
      recentInquiries,
    });
  } catch (error) {
    logger.error("Admin stats error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
