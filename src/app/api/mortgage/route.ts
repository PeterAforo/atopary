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

    const where: any = {};
    if (session.user.role === "BUYER") {
      where.buyerId = session.user.id;
    }

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
  } catch (error: any) {
    logger.error("Mortgage application error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
