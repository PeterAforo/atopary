import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    const section = await prisma.cMSSection.findUnique({
      where: { key },
    });

    if (!section || !section.isActive) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
