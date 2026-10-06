import { NextRequest, NextResponse } from "next/server";
import { listarEventosCalendario } from "@/lib/actions/compromissos";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  if (!de || !ate) {
    return NextResponse.json({ erro: "Parâmetros 'de' e 'ate' obrigatórios." }, { status: 400 });
  }

  try {
    const eventos = await listarEventosCalendario(de, ate);
    return NextResponse.json(eventos);
  } catch {
    return NextResponse.json({ erro: "Erro ao buscar eventos." }, { status: 500 });
  }
}
