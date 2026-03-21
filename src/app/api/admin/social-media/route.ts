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

    const embeds = await prisma.socialMediaEmbed.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(embeds);
  } catch (error) {
    logger.error("Social media fetch error", error);
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
    const { platform, postUrl, embedCode, caption, order, isActive } = body;

    if (!platform || !postUrl) {
      return NextResponse.json({ error: "Platform and post URL are required" }, { status: 400 });
    }

    const embed = await prisma.socialMediaEmbed.create({
      data: {
        platform,
        postUrl,
        embedCode: embedCode || null,
        caption: caption || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(embed, { status: 201 });
  } catch (error) {
    logger.error("Social media create error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
