import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { platform, postUrl, embedCode, caption, order, isActive } = body;

    const data: Record<string, unknown> = {};
    if (platform !== undefined) data.platform = platform;
    if (postUrl !== undefined) data.postUrl = postUrl;
    if (embedCode !== undefined) data.embedCode = embedCode;
    if (caption !== undefined) data.caption = caption;
    if (order !== undefined) data.order = order;
    if (isActive !== undefined) data.isActive = isActive;

    const embed = await prisma.socialMediaEmbed.update({
      where: { id },
      data,
    });

    return NextResponse.json(embed);
  } catch (error) {
    logger.error("Social media update error", error);
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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.socialMediaEmbed.delete({ where: { id } });
    return NextResponse.json({ message: "Embed deleted" });
  } catch (error) {
    logger.error("Social media delete error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
