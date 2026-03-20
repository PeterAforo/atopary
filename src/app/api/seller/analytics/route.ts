import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

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
      rejectedProperties,
      totalInquiries,
      pendingInquiries,
      respondedInquiries,
      viewsResult,
      properties,
    ] = await Promise.all([
      prisma.property.count({ where: { sellerId } }),
      prisma.property.count({ where: { sellerId, status: "APPROVED" } }),
      prisma.property.count({ where: { sellerId, status: "PENDING" } }),
      prisma.property.count({ where: { sellerId, status: "REJECTED" } }),
      prisma.inquiry.count({ where: { property: { sellerId } } }),
      prisma.inquiry.count({ where: { property: { sellerId }, status: "NEW" } }),
      prisma.inquiry.count({ where: { property: { sellerId }, status: "RESPONDED" } }),
      prisma.property.aggregate({ where: { sellerId }, _sum: { views: true } }),
      prisma.property.findMany({
        where: { sellerId },
        orderBy: { views: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          price: true,
          status: true,
          views: true,
          type: true,
          createdAt: true,
          _count: { select: { inquiries: true } },
        },
      }),
    ]);

    // Property type breakdown
    const typeBreakdown = await prisma.property.groupBy({
      by: ["type"],
      where: { sellerId },
      _count: { type: true },
    });

    // Status breakdown
    const statusBreakdown = await prisma.property.groupBy({
      by: ["status"],
      where: { sellerId },
      _count: { status: true },
    });

    return NextResponse.json({
      overview: {
        totalProperties,
        approvedProperties,
        pendingProperties,
        rejectedProperties,
        totalInquiries,
        pendingInquiries,
        respondedInquiries,
        totalViews: viewsResult._sum.views || 0,
        responseRate: totalInquiries > 0 ? Math.round((respondedInquiries / totalInquiries) * 100) : 0,
      },
      topProperties: properties.map((p) => ({
        ...p,
        inquiryCount: p._count.inquiries,
      })),
      typeBreakdown: typeBreakdown.map((t) => ({
        type: t.type,
        count: t._count.type,
      })),
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
    });
  } catch (error) {
    logger.error("Seller analytics error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
