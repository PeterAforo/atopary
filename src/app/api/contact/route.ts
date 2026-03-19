import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { contactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const message = await prisma.contactMessage.create({
      data: validated,
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
