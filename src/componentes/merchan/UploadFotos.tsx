"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { uploadFotoMerchan, deletarFotoMerchan } from "@/lib/actions/storage";

type Props = {
  fotosIniciais?: string[];
};

export function UploadFotos({ fotosIniciais = [] }: Props) {
  const [urls, setUrls] = useState<string[]>(fotosIniciais);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function selecionar() {
    inputRef.current?.click();
  }

  function handleArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    if (arquivos.length === 0) return;
    setErro(null);
    startTransition(async () => {
      for (const arquivo of arquivos) {
        const fd = new FormData();
        fd.append("arquivo", arquivo);
        const res = await uploadFotoMerchan(fd);
        if (!res.ok) { setErro(res.erro); break; }
        setUrls((prev) => [...prev, res.url]);
      }
    });
    e.target.value = "";
  }

  function remover(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
    startTransition(async () => { await deletarFotoMerchan(url); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {urls.map((url) => (
        <input key={url} type="hidden" name="fotos" value={url} />
      ))}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
        {urls.map((url, i) => (
          <div key={url} style={{ position: "relative" }}>
            <img src={url} alt={`Foto ${i + 1}`} style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 6, display: "block" }} />
            <button
              type="button"
              onClick={() => remover(url)}
              style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
              aria-label="Remover foto"
            >
              <X size={12} color="#fff" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={selecionar}
          disabled={pending}
          style={{ width: 88, height: 88, borderRadius: 6, border: "1.5px dashed #b0b8c1", background: "#f8f9fa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: pending ? "wait" : "pointer", color: "#6c757d", fontSize: 12 }}
        >
          {pending ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
          <span>{pending ? "Enviando…" : "Adicionar"}</span>
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleArquivos} style={{ display: "none" }} />
      {erro && <small style={{ color: "var(--cor-erro, #dc3545)" }}>{erro}</small>}
    </div>
  );
}
