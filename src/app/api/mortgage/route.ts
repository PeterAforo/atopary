import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { calculateMortgage } from "@/lib/utils";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const status = searchParams.get("status");
    const where: Record<string, unknown> = {};
    if (session.user.role === "BUYER") {
      where.buyerId = session.user.id;
    }
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.mortgageApplication.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, title: true, price: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mortgageApplication.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error("Mortgage fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      nationalId,
      address,
      employerName,
      jobTitle,
      monthlyIncome,
      employmentYears,
      loanAmount,
      loanTermYears,
      downPayment,
      propertyId,
      notes,
    } = body;

    const interestRate = 18;
    const mortgage = calculateMortgage(loanAmount, interestRate, loanTermYears);

    const application = await prisma.mortgageApplication.create({
      data: {
        fullName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationalId,
        address,
        employerName,
        jobTitle,
        monthlyIncome: parseFloat(monthlyIncome),
        employmentYears: employmentYears ? parseInt(employmentYears) : null,
        loanAmount: parseFloat(loanAmount),
        loanTermYears: parseInt(loanTermYears),
        interestRate,
        downPayment: parseFloat(downPayment),
        monthlyPayment: mortgage.monthlyPayment,
        propertyId: propertyId || null,
        buyerId: session.user.id,
        notes,
      },
      include: {
        property: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    logger.error("Mortgage application error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Bulk actions on mortgage applications (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body as { ids: string[]; action: string };

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    switch (action) {
      case "approve":
        await prisma.mortgageApplication.updateMany({ where: { id: { in: ids } }, data: { status: "APPROVED" } });
        break;
      case "reject":
        await prisma.mortgageApplication.updateMany({ where: { id: { in: ids } }, data: { status: "REJECTED" } });
        break;
      case "under_review":
        await prisma.mortgageApplication.updateMany({ where: { id: { in: ids } }, data: { status: "UNDER_REVIEW" } });
        break;
      case "delete":
        await prisma.mortgageApplication.deleteMany({ where: { id: { in: ids } } });
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ message: `Bulk ${action} completed on ${ids.length} applications` });
  } catch (error) {
    logger.error("Bulk mortgage action error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
