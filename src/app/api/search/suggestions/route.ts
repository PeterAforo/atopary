import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Search for properties, cities, and locations
    const [properties, cities, locations] = await Promise.all([
      // Property suggestions (title, address, city)
      prisma.property.findMany({
        where: {
          status: "APPROVED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          title: true,
          address: true,
          city: true,
          type: true,
        },
        take: 5,
      }),

      // City suggestions
      prisma.property.findMany({
        where: {
          status: "APPROVED",
          city: { contains: query, mode: "insensitive" },
        },
        select: {
          city: true,
        },
        distinct: ["city"],
        take: 5,
      }),

      // Location suggestions (areas in addresses)
      prisma.property.findMany({
        where: {
          status: "APPROVED",
          address: { contains: query, mode: "insensitive" },
        },
        select: {
          address: true,
        },
        take: 5,
      }),
    ]);

    // Combine and deduplicate suggestions
    const suggestions: Array<{
      type: "property" | "city" | "location";
      text: string;
      data?: any;
    }>() = [];

    // Add property suggestions
    properties.forEach((property) => {
      let matched = false;
      let text = "";

      if (property.title.toLowerCase().includes(query)) {
        text = property.title;
        matched = true;
      } else if (property.address.toLowerCase().includes(query)) {
        text = `${property.address}, ${property.city}`;
        matched = true;
      }

      if (matched && !suggestions.find(s => s.text === text)) {
        suggestions.push({
          type: "property",
          text,
          data: property,
        });
      }
    });

    // Add city suggestions
    cities.forEach((cityObj) => {
      const city = cityObj.city;
      if (city && city.toLowerCase().includes(query) && 
          !suggestions.find(s => s.text === city)) {
        suggestions.push({
          type: "city",
          text: city,
        });
      }
    });

    // Add location suggestions
    locations.forEach((property) => {
      if (property.address && 
          property.address.toLowerCase().includes(query) &&
          !suggestions.find(s => s.text === property.address)) {
        suggestions.push({
          type: "location",
          text: property.address,
        });
      }
    });

    // Sort by relevance (exact matches first, then alphabetical)
    suggestions.sort((a, b) => {
      const aExact = a.text.toLowerCase() === query;
      const bExact = b.text.toLowerCase() === query;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      if (aExact && bExact) return a.text.localeCompare(b.text);
      
      return a.text.localeCompare(b.text);
    });

    // Limit to 10 suggestions total
    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 10)
    });
  } catch (error) {
    logger.error("Search suggestions error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
