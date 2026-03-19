import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const page = await prisma.cMSPage.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("CMS page update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.cMSPage.delete({ where: { id } });
    return NextResponse.json({ message: "Page deleted" });
  } catch (error) {
    console.error("CMS page delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
