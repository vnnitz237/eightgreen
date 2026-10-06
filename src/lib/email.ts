import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export type MensagemEmail = { para: string; assunto: string; texto: string };
export type ResultadoEmail = { enviado: boolean; motivo?: string };

export interface ProvedorEmail {
  enviar(mensagem: MensagemEmail): Promise<ResultadoEmail>;
}

class ProvedorApi implements ProvedorEmail {
  async enviar(mensagem: MensagemEmail) {
    const url = process.env.EMAIL_API_URL;
    const chave = process.env.EMAIL_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!url || !chave || !from) return { enviado: false, motivo: "Provedor de e-mail incompleto." };
    if (process.env.NODE_ENV === "production" && !url.startsWith("https://")) return { enviado: false, motivo: "O provedor exige HTTPS em produção." };
    const resposta = await fetch(url, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${chave}` }, body: JSON.stringify({ from, to: mensagem.para, subject: mensagem.assunto, text: mensagem.texto }), signal: AbortSignal.timeout(10_000) });
    if (!resposta.ok) return { enviado: false, motivo: `O provedor recusou o envio (${resposta.status}).` };
    return { enviado: true };
  }
}

class ProvedorArquivoDesenvolvimento implements ProvedorEmail {
  async enviar(mensagem: MensagemEmail) {
    if (process.env.NODE_ENV === "production") return { enviado: false, motivo: "O provedor de arquivo é proibido em produção." };
    const pasta = path.join(process.cwd(), ".emails-dev");
    await mkdir(pasta, { recursive: true, mode: 0o700 });
    const nome = `${Date.now()}-${randomUUID()}.txt`;
    await writeFile(path.join(pasta, nome), `Para: ${mensagem.para}\nAssunto: ${mensagem.assunto}\n\n${mensagem.texto}`, { mode: 0o600 });
    return { enviado: true };
  }
}

class ProvedorAusente implements ProvedorEmail {
  async enviar() { return { enviado: false, motivo: "Nenhum provedor de e-mail configurado." }; }
}

export function obterProvedorEmail(): ProvedorEmail {
  if (process.env.EMAIL_PROVIDER === "api") return new ProvedorApi();
  if (process.env.EMAIL_PROVIDER === "arquivo") return new ProvedorArquivoDesenvolvimento();
  return new ProvedorAusente();
}

export function mensagemPrimeiroAcesso({ nome, email, senhaTemporaria, expiraEm }: { nome: string; email: string; senhaTemporaria: string; expiraEm: Date }): MensagemEmail {
  return { para: email, assunto: "Seu acesso ao Eight Green", texto: `Olá, ${nome}.\n\nSeu acesso ao Eight Green foi criado.\nE-mail: ${email}\nSenha temporária: ${senhaTemporaria}\nValidade: ${expiraEm.toLocaleString("pt-BR")}\n\nEntre no sistema e defina imediatamente uma nova senha. A credencial temporária é de uso único.` };
}
