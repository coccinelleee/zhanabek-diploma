import { extractPartInfoFromLCSCResponse } from "@/lib/helper/lcsc_api";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * 10;

    const parts = await prisma.part.findMany({
      orderBy: { id: "desc" },
      take: 10,
      skip,
    });

    return NextResponse.json({ status: 200, parts });
  } catch (error: any) {
    console.error("GET /api/parts error:", error.message);
    return NextResponse.json({ status: 500, error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();
    const { pc, quantity } = res;

    if (!pc || typeof pc !== "string" || typeof quantity !== "number") {
      return NextResponse.json({
        status: 400,
        error: "Invalid or missing 'pc' or 'quantity'",
      });
    }

    const existing = await prisma.part.findUnique({
      where: { productCode: pc },
    });

    if (existing) {
      const updated = await prisma.part.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
        },
      });

      return NextResponse.json({
        status: 200,
        body: updated,
        message: "Part updated",
      });
    }

    // --- Fetch from LCSC ---
    const apiRes = await fetch(`https://wmsc.lcsc.com/wmsc/product/detail?productCode=${pc}`);
    if (!apiRes.ok) {
      return NextResponse.json({
        status: 502,
        error: "Failed to fetch from LCSC",
      });
    }

    const rawLCSC = await apiRes.json();
    const partInfo = extractPartInfoFromLCSCResponse(rawLCSC);

    // --- Create new part ---
    const partCreate = await prisma.part.create({
      data: {
        title: partInfo.title,
        quantity: quantity,
        productId: partInfo.productId,
        productCode: partInfo.productCode,
        productModel: partInfo.productModel,
        productDescription: partInfo.productDescription,
        parentCatalogName: partInfo.parentCatalogName,
        catalogName: partInfo.catalogName,
        brandName: partInfo.brandName,
        encapStandard: partInfo.encapStandard,
        productImages: partInfo.productImages,
        pdfLink: partInfo.pdfLink,
        productLink: partInfo.productLink,
        prices: partInfo.prices,
        voltage: partInfo.voltage,
        resistance: partInfo.resistance,
        power: partInfo.power,
        current: partInfo.current,
        tolerance: partInfo.tolerance,
        frequency: partInfo.frequency,
        capacitance: partInfo.capacitance,
        inductance: partInfo.inductance,
      },
    });

    const itemCount = await prisma.part.count();
    const parentCatalogNamesRaw = await prisma.part.groupBy({ by: ["parentCatalogName"] });
    const parentCatalogNames = parentCatalogNamesRaw
      .map((item) => item.parentCatalogName)
      .filter(Boolean);

    return NextResponse.json({
      status: 200,
      body: partCreate,
      itemCount,
      parentCatalogNames,
      message: "Бөлім құрылды",
    });

  } catch (error: any) {
    console.error("POST /api/parts error:", error.message);
    return NextResponse.json({ status: 500, error: error.message });
  }
}
