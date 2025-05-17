export const dynamic = 'force-dynamic';
import { PartState } from "@/lib/helper/part_state";
import PartPage from "./partPage";
import prisma from "@/lib/prisma";

export default async function Part({ params }: { params: { partId: string } }) {

  console.log("param:", params.partId);
  console.log("type:", typeof params.partId);
  console.log("parsed:", parseInt(params.partId));

  const partInfo = await prisma.part.findUnique({
    where: { id: parseInt(params.partId) }
  }) as PartState;

  return <PartPage part={partInfo} />;
}
