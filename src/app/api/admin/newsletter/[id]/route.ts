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
    const { subject, content, status } = body;

    const data: Record<string, unknown> = {};
    if (subject !== undefined) data.subject = subject;
    if (content !== undefined) data.content = content;
    if (status !== undefined) data.status = status;

    // If "sending", mark sentAt and count active subscribers
    if (status === "sent") {
      const activeCount = await prisma.newsletterSubscriber.count({ where: { isActive: true } });
      data.sentAt = new Date();
      data.sentCount = activeCount;
    }

    const campaign = await prisma.newsletterCampaign.update({
      where: { id },
      data,
    });

    return NextResponse.json(campaign);
  } catch (error) {
    logger.error("Newsletter campaign update error", error);
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

    await prisma.newsletterCampaign.delete({ where: { id } });
    return NextResponse.json({ message: "Campaign deleted" });
  } catch (error) {
    logger.error("Newsletter campaign delete error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
