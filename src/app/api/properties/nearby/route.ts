import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radius = parseFloat(searchParams.get("radius") || "50"); // km
    const limit = parseInt(searchParams.get("limit") || "8");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    // Fetch all approved properties with coordinates
    const properties = await prisma.property.findMany({
      where: {
        status: "APPROVED",
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        seller: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Calculate distance and filter
    const nearby = properties
      .map((p) => ({
        ...p,
        distance: haversineDistance(lat, lng, p.latitude!, p.longitude!),
      }))
      .filter((p) => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({ properties: nearby });
  } catch (error) {
    logger.error("Nearby properties fetch error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
