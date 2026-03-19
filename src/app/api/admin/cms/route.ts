import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await prisma.cMSPage.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    logger.error("CMS pages fetch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, metaTitle, metaDesc, isPublished } = body;

    const page = await prisma.cMSPage.create({
      data: { title, slug, content, metaTitle, metaDesc, isPublished },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    logger.error("CMS page create error", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
