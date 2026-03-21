import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

// GET subscribers + campaigns
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "subscribers";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    if (tab === "campaigns") {
      const [campaigns, total] = await Promise.all([
        prisma.newsletterCampaign.findMany({
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.newsletterCampaign.count(),
      ]);
      return NextResponse.json({ campaigns, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }

    // Default: subscribers
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [subscribers, total, activeCount] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      subscribers,
      activeCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error("Newsletter admin fetch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create campaign
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, content } = body;

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
    }

    const campaign = await prisma.newsletterCampaign.create({
      data: { subject, content, status: "draft" },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    logger.error("Newsletter campaign create error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Bulk actions
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body as { ids: string[]; action: string };

    if (!ids?.length || !action) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    switch (action) {
      case "delete_subscribers":
        await prisma.newsletterSubscriber.deleteMany({ where: { id: { in: ids } } });
        break;
      case "deactivate_subscribers":
        await prisma.newsletterSubscriber.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false, unsubscribedAt: new Date() },
        });
        break;
      case "activate_subscribers":
        await prisma.newsletterSubscriber.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true, unsubscribedAt: null },
        });
        break;
      case "delete_campaigns":
        await prisma.newsletterCampaign.deleteMany({ where: { id: { in: ids } } });
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ message: `Action '${action}' applied to ${ids.length} items` });
  } catch (error) {
    logger.error("Newsletter bulk action error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
