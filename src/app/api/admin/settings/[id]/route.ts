import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

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

    await prisma.siteSettings.delete({ where: { id } });
    return NextResponse.json({ message: "Setting deleted" });
  } catch (error) {
    logger.error("Setting delete error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
