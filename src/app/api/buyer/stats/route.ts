import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buyerId = session.user.id;

    const [totalInquiries, totalMortgages, recentInquiries] = await Promise.all([
      prisma.inquiry.count({ where: { buyerId } }),
      prisma.mortgageApplication.count({ where: { buyerId } }),
      prisma.inquiry.findMany({
        where: { buyerId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          property: { select: { id: true, title: true, slug: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalInquiries,
      totalMortgages,
      recentInquiries,
    });
  } catch (error) {
    logger.error("Buyer stats error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
