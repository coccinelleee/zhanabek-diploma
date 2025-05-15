export const dynamic = 'force-dynamic';
import { PartState } from "@/lib/helper/part_state";
import PartPage from "./partPage";
import prisma from "@/lib/prisma";
import { notFound } from 'next/navigation';

export default async function Part({ params }: { params: { partId: string } }) {
  const partInfo = await prisma.part.findUnique({
    where: { id: parseInt(params.partId) }
  }) as PartState | null;

  if (!partInfo) {
    return notFound(); 
  }

  return <PartPage part={partInfo} />;
}
