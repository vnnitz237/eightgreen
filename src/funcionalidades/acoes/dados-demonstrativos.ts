import type { AcaoPromocional, RepositorioAcoes } from "./tipos";

export const acoesDemonstrativas: AcaoPromocional[] = [
  { id: "AC-1048", titulo: "Ativação Linha Energia", data: "2026-09-03", horario: "09:00", status: "encerrada", distribuidora: { id: "D-01", nome: "Distribuidora Horizonte" }, estabelecimento: { modo: "cadastrado", id: "E-01", nome: "Mercado Estação" }, profissionais: [{ id: "P-01", nome: "Ana Martins", modo: "cadastrada" }], produtos: [{ id: "PR-01", nome: "Bebida Energia 250 ml", quantidadePlanejada: 72 }] },
  { id: "AC-1051", titulo: "Degustação Bem-estar", data: "2026-09-08", horario: "14:00", status: "encerrada", distribuidora: { id: "D-02", nome: "Rede Litoral" }, estabelecimento: { modo: "cadastrado", id: "E-02", nome: "Empório do Parque" }, profissionais: [{ id: "P-02", nome: "Beatriz Costa", modo: "cadastrada" }], produtos: [{ id: "PR-02", nome: "Mix Proteico 30 g", quantidadePlanejada: 96 }] },
  { id: "AC-1054", titulo: "Experiência Sabor & Movimento", data: "2026-09-15", horario: "10:30", status: "encerrada", distribuidora: { id: "D-01", nome: "Distribuidora Horizonte" }, estabelecimento: { modo: "avulso", nome: "Feira Vida Ativa" }, profissionais: [{ id: "P-03", nome: "Carla Nunes", modo: "cadastrada" }, { id: "AV-01", nome: "Profissional convidada", modo: "avulsa" }], produtos: [{ id: "PR-03", nome: "Snack Cacau 40 g", quantidadePlanejada: 120 }] },
  { id: "AC-1058", titulo: "Circuito Performance", data: "2026-09-22", horario: "16:00", status: "aberta", distribuidora: { id: "D-03", nome: "Comercial Veredas" }, estabelecimento: { modo: "cadastrado", id: "E-03", nome: "Loja Movimento" }, profissionais: [{ id: "P-04", nome: "Diana Alves", modo: "cadastrada" }], produtos: [{ id: "PR-04", nome: "Gel Energia 30 g", quantidadePlanejada: 80 }] },
  { id: "AC-1061", titulo: "Ação Comunidade Ativa", data: "2026-09-29", horario: "08:30", status: "aberta", distribuidora: null, estabelecimento: { modo: "avulso", nome: "Praça das Palmeiras" }, profissionais: [{ id: "P-02", nome: "Beatriz Costa", modo: "cadastrada" }], produtos: [{ id: "PR-01", nome: "Bebida Energia 250 ml", quantidadePlanejada: 144 }] },
  { id: "AC-1065", titulo: "Semana do Movimento", data: "2026-10-05", horario: "13:00", status: "aberta", distribuidora: { id: "D-02", nome: "Rede Litoral" }, estabelecimento: { modo: "cadastrado", id: "E-04", nome: "Supermercado Alameda" }, profissionais: [{ id: "P-01", nome: "Ana Martins", modo: "cadastrada" }], produtos: [{ id: "PR-02", nome: "Mix Proteico 30 g", quantidadePlanejada: 160 }] },
  { id: "AC-1039", titulo: "Encontro Nutrição Prática", data: "2026-08-21", horario: "17:00", status: "encerrada", distribuidora: { id: "D-03", nome: "Comercial Veredas" }, estabelecimento: { modo: "cadastrado", id: "E-05", nome: "Clube Bem Viver" }, profissionais: [{ id: "P-03", nome: "Carla Nunes", modo: "cadastrada" }], produtos: [{ id: "PR-03", nome: "Snack Cacau 40 g", quantidadePlanejada: 64 }] },
];

export const estoqueDemonstrativo = [
  { produto: "Bebida Energia 250 ml", quantidade: 684, minimo: 240 },
  { produto: "Mix Proteico 30 g", quantidade: 428, minimo: 180 },
  { produto: "Snack Cacau 40 g", quantidade: 212, minimo: 160 },
  { produto: "Gel Energia 30 g", quantidade: 96, minimo: 120 },
];

export const repositorioAcoesDemonstrativo: RepositorioAcoes = {
  async listar() { return acoesDemonstrativas; },
};
