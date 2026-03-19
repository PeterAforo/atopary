import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerId = session.user.id;

    const [
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalInquiries,
      viewsResult,
      recentProperties,
    ] = await Promise.all([
      prisma.property.count({ where: { sellerId } }),
      prisma.property.count({ where: { sellerId, status: "APPROVED" } }),
      prisma.property.count({ where: { sellerId, status: "PENDING" } }),
      prisma.inquiry.count({ where: { property: { sellerId } } }),
      prisma.property.aggregate({ where: { sellerId }, _sum: { views: true } }),
      prisma.property.findMany({
        where: { sellerId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, city: true, price: true, status: true, views: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalInquiries,
      totalViews: viewsResult._sum.views || 0,
      recentProperties,
    });
  } catch (error) {
    console.error("Seller stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
