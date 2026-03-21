import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ message: "You're already subscribed!" });
      }
      // Re-activate
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null, name: name || existing.name },
      });
      return NextResponse.json({ message: "Welcome back! You've been re-subscribed." });
    }

    await prisma.newsletterSubscriber.create({
      data: { email, name: name || null },
    });

    return NextResponse.json({ message: "Successfully subscribed to our newsletter!" }, { status: 201 });
  } catch (error) {
    logger.error("Newsletter subscribe error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
