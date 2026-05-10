import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const isRead = searchParams.get("isRead");

    const where: Record<string, unknown> = {};
    if (isRead === "true") where.isRead = true;
    if (isRead === "false") where.isRead = false;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error("Messages fetch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids } = body as { action: string; ids: string[] };

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    switch (action) {
      case "mark-read":
        await prisma.contactMessage.updateMany({
          where: { id: { in: ids } },
          data: { isRead: true },
        });
        return NextResponse.json({ message: `${ids.length} messages marked as read` });

      case "mark-unread":
        await prisma.contactMessage.updateMany({
          where: { id: { in: ids } },
          data: { isRead: false },
        });
        return NextResponse.json({ message: `${ids.length} messages marked as unread` });

      case "archive":
        await prisma.contactMessage.updateMany({
          where: { id: { in: ids } },
          data: { isRead: true },
        });
        return NextResponse.json({ message: `${ids.length} messages archived` });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error("Admin messages patch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json() as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.contactMessage.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ message: `${ids.length} messages deleted` });
  } catch (error) {
    logger.error("Admin messages delete error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
