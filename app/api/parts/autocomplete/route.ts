import { extractPartInfoFromLCSCResponse } from "@/lib/helper/lcsc_api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();
    const pcNumber = res.productCode;

    if (!pcNumber) {
      return NextResponse.json({ status: 400, error: "Өнім коды жоқ" });
    }

    const apiResponse = await fetch(
      "https://wmsc.lcsc.com/ftps/wm/product/detail?productCode=" + pcNumber
    );

    if (!apiResponse.ok) {
      throw new Error("LCSC API fetch failed with status " + apiResponse.status);
    }

    const LSCSPart = await apiResponse.json();

    if (!LSCSPart || typeof LSCSPart !== "object") {
      throw new Error("IL API-дан жарамсыз жауап");
    }

    const partInfo = extractPartInfoFromLCSCResponse(LSCSPart);

    return NextResponse.json({ status: 200, body: partInfo });
  } catch (error: any) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ status: 500, error: error?.message || "Ішкі қате" });
  }
}
