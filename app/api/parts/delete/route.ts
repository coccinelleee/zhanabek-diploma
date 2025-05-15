import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();

    const partId = res.id;
    // const
    const deletedPart = await prisma.part.delete({ where: { id: partId } });
    const itemCount = await prisma.part.aggregate({ _count: true });
    const parentCatalogNamesRaw = await prisma.part.groupBy({
      by: ["parentCatalogName"],
    });
    const parentCatalogNames = parentCatalogNamesRaw.map(
      (item: any) => item.parentCatalogName
    );
    if (deletedPart) {
      return NextResponse.json({
        status: 200,
        body: deletedPart,
        itemCount: itemCount._count,
        parentCatalogNames: parentCatalogNames,
        message: "Part deleted",
      });
    } else {
      return NextResponse.json({ status: 500, error: "Бөлім жойылмады" });
    }
  } catch (error: ErrorCallback | any) {
    return NextResponse.json({ status: 500, error: error });
  }
}
