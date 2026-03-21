import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (!subscriber || !subscriber.isActive) {
      return NextResponse.json({ message: "Email not found or already unsubscribed" });
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    return NextResponse.json({ message: "Successfully unsubscribed" });
  } catch (error) {
    logger.error("Newsletter unsubscribe error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
