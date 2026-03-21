import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const limiter = rateLimit(`verify:${ip}`, { windowMs: 60_000, maxRequests: 10 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.resetIn / 1000)) } }
      );
    }

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Find the latest unused token for this email
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: { email, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "No valid verification token found. It may have expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (verificationToken.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({
      message: "Email verified successfully. You can now log in.",
      verified: true,
    });
  } catch (error) {
    logger.error("Email verification error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
