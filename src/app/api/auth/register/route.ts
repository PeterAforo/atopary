import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/db";
import { z } from "zod";
import { registerSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const limiter = rateLimit(`register:${ip}`, { windowMs: 60_000, maxRequests: 5 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    const validated = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        phone: validated.phone,
        role: validated.role,
        // emailVerified stays null until OTP is confirmed
      },
    });

    // Generate a 6-digit OTP and a secure token
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Invalidate any previous tokens for this email
    await prisma.emailVerificationToken.updateMany({
      where: { email: validated.email, used: false },
      data: { used: true },
    });

    await prisma.emailVerificationToken.create({
      data: { token, email: validated.email, otp, expiresAt },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?email=${encodeURIComponent(validated.email)}`;

    // TODO: Integrate email service (SendGrid, Resend, etc.) to send OTP to user
    // For now, return OTP in development mode
    const response: Record<string, unknown> = {
      message: "Account created. Please verify your email with the OTP sent to your inbox.",
      requiresVerification: true,
      email: validated.email,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };

    if (process.env.NODE_ENV === "development") {
      response._dev = { otp, token, verifyUrl };
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    logger.error("Registration error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
