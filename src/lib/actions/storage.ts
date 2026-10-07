"use server";

import { criarClienteSupabase } from "@/lib/supabase/server";

const BUCKET = "merchan-fotos";

export async function uploadFotoMerchan(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; erro: string }> {
  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) return { ok: false, erro: "Nenhum arquivo enviado." };
  if (!arquivo.type.startsWith("image/")) return { ok: false, erro: "Apenas imagens são aceitas." };
  if (arquivo.size > 5 * 1024 * 1024) return { ok: false, erro: "Arquivo deve ter no máximo 5 MB." };

  try {
    const supabase = criarClienteSupabase();
    const ext = arquivo.name.split(".").pop() ?? "jpg";
    const nome = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await arquivo.arrayBuffer();

    const { error } = await supabase.storage.from(BUCKET).upload(nome, bytes, { contentType: arquivo.type });
    if (error) return { ok: false, erro: error.message };

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(nome);
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : "Erro no upload." };
  }
}

export async function deletarFotoMerchan(url: string): Promise<{ ok: boolean }> {
  try {
    const supabase = criarClienteSupabase();
    const urlObj = new URL(url);
    const partes = urlObj.pathname.split(`/object/public/${BUCKET}/`);
    const caminho = partes[1];
    if (!caminho) return { ok: false };
    await supabase.storage.from(BUCKET).remove([caminho]);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
