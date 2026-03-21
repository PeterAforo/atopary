import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const limiter = rateLimit(`resend:${ip}`, { windowMs: 60_000, maxRequests: 3 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.resetIn / 1000)) } }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether the user exists
      return NextResponse.json({ message: "If an account with that email exists, a new OTP has been sent." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Invalidate previous tokens
    await prisma.emailVerificationToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Generate new OTP + token
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.emailVerificationToken.create({
      data: { token, email, otp, expiresAt },
    });

    // TODO: Send OTP via email service
    const response: Record<string, unknown> = {
      message: "A new verification code has been sent to your email.",
    };

    if (process.env.NODE_ENV === "development") {
      response._dev = { otp, token };
    }

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Resend verification error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
