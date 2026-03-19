import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { contactSchema } from "@/lib/validations";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const limiter = rateLimit(`contact:${ip}`, { windowMs: 60_000, maxRequests: 3 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    const validated = contactSchema.parse(body);

    const message = await prisma.contactMessage.create({
      data: sanitizeObject(validated),
    });

    return NextResponse.json({ message: "Message sent successfully", id: message.id }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Contact message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
