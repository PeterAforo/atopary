import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";
import { emailService } from "@/lib/email";

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
    const { status, adminNotes } = body;

    // Get current mortgage application to have email for notification
    const currentMortgage = await prisma.mortgageApplication.findUnique({
      where: { id },
      select: { email: true }
    });

    const updated = await prisma.mortgageApplication.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    // Send email notification if status changed
    if (status && currentMortgage?.email) {
      await emailService.sendMortgageStatusUpdate(
        currentMortgage.email,
        status,
        adminNotes
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Mortgage update error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
