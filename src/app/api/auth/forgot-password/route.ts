import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const limiter = rateLimit(`forgot:${ip}`, { windowMs: 60_000, maxRequests: 3 });
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

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If an account with that email exists, a reset link has been generated." });
    }

    // Invalidate any existing tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, email, expiresAt },
    });

    // In production, send this link via email. For now, return the token in development.
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        message: "If an account with that email exists, a reset link has been generated.",
        // Only exposed in development:
        _dev: { resetUrl, token },
      });
    }

    // TODO: Integrate email service (SendGrid, Resend, etc.) to send resetUrl to user
    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been generated.",
    });
  } catch (error) {
    logger.error("Forgot password error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
