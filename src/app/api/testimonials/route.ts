import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Testimonials fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
