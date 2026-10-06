import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const produtoId = searchParams.get("produtoId");

  if (!produtoId) {
    return NextResponse.json({ quantidade: 0 });
  }

  const saldo = await prisma.saldoEstoque.findUnique({
    where: { produtoId },
    select: { quantidade: true },
  });

  return NextResponse.json({ quantidade: saldo?.quantidade ?? 0 });
}
