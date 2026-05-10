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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { response, status } = body;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: { 
        property: { select: { sellerId: true, title: true } },
        buyer: { select: { name: true, email: true } }
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Only the seller of the property or admin can respond
    if (session.user.role !== "ADMIN" && inquiry.property.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(response !== undefined && { response }),
        ...(status !== undefined && { status }),
      },
    });

    // Send email notification to buyer if response is provided
    if (response && inquiry.buyer?.email) {
      await emailService.sendInquiryResponse(
        inquiry.buyer.email,
        inquiry.property.title,
        session.user.name,
        response
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Inquiry update error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
