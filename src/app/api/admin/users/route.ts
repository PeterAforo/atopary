import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import logger from "@/lib/logger";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          isActive: true, createdAt: true, avatar: true,
          _count: { select: { properties: true, inquiries: true, mortgages: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error("Users fetch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create a new user (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role || "BUYER",
        isActive: true,
        emailVerified: new Date(),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.error("User creation error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Bulk actions on users (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action, value } = body as { ids: string[]; action: string; value?: string };

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Don't allow bulk actions on own account
    const safeIds = ids.filter((id: string) => id !== session.user.id);

    switch (action) {
      case "activate":
        await prisma.user.updateMany({ where: { id: { in: safeIds } }, data: { isActive: true } });
        break;
      case "deactivate":
        await prisma.user.updateMany({ where: { id: { in: safeIds } }, data: { isActive: false } });
        break;
      case "delete":
        await prisma.user.deleteMany({ where: { id: { in: safeIds } } });
        break;
      case "changeRole":
        if (!value) return NextResponse.json({ error: "Role value required" }, { status: 400 });
        await prisma.user.updateMany({ where: { id: { in: safeIds } }, data: { role: value as "ADMIN" | "SELLER" | "BUYER" } });
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ message: `Bulk ${action} completed on ${safeIds.length} users` });
  } catch (error) {
    logger.error("Bulk user action error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
