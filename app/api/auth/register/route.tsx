import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma";

const UserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const parsedBody = await req.json();

    const validationResult = UserSchema.safeParse(parsedBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Пайдаланушы деректері дұрыс емес" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(validationResult.data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...validationResult.data,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as PrismaClientKnownRequestError).code === "P2002"
    ) {
      // Бірегей шектеу қатесі — электрондық пошта бұрын тіркелген
      return NextResponse.json(
        { error: "Бұл электрондық пошта бұрын тіркелген" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Жаңа пайдаланушыны жасау кезінде қате орын алды" },
      { status: 500 }
    );
  }
}
