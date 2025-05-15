import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Қолмен жаңа компонент қосу

export async function POST(request: NextRequest) {
  try {
    // Сұраныс денесі – компонент туралы мәліметтер
    const reqBody = await request.json();

    console.log(reqBody);

    // Компонент бұрыннан бар ма тексеру
    const pcNumber = reqBody.productCode;
    const partExists = await prisma.part.findUnique({
      where: {
        productCode: pcNumber,
      },
    });

    if (partExists) {
      console.log("Компонент бұрыннан бар");
      return NextResponse.json({ error: "Компонент бұрыннан тіркелген" }, { status: 409 });
    } else {
      // reqBody-де null мәндер болуы мүмкін – create кезінде қате болады
      // Сондықтан null мәндерді алып тастаймыз
      const validData = Object.fromEntries(
        Object.entries(reqBody).filter(([key, value]) => value && value !== null)
      ) as Prisma.PartUncheckedCreateInput;

      console.log("Компонент қосылуда...");
      const partCreate = await prisma.part.create({
        data: validData,
      });

      if (partCreate) {
        console.log("Компонент сәтті қосылды:");
        console.log(partCreate);
        return NextResponse.json({
          body: partCreate,
          message: "Компонент сәтті қосылды",
        }, { status: 200 });
      } else {
        return NextResponse.json({ error: "Компонент қосылмады" }, { status: 500 });
      }
    }
  } catch (error: ErrorCallback | any) {
    console.log("Компонент қосу кезінде қате:", error);
    return NextResponse.json({ error: "Компонент қосу кезінде қате болды" }, { status: 500 });
  }
}
