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

    const sections = await prisma.cMSSection.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    logger.error("CMS sections fetch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, title, subtitle, content, image, order, isActive } = body;

    if (!key || !title) {
      return NextResponse.json({ error: "Key and title are required" }, { status: 400 });
    }

    const section = await prisma.cMSSection.create({
      data: {
        key,
        title,
        subtitle: subtitle || null,
        content: content || null,
        image: image || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    logger.error("CMS section create error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
