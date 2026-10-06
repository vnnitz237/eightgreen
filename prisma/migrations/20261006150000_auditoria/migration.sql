-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "operacao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "registro_id" TEXT NOT NULL,
    "estado_anterior" JSONB,
    "estado_posterior" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autor_id" TEXT NOT NULL,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditorias_entidade_registro_id_idx" ON "auditorias"("entidade", "registro_id");

-- CreateIndex
CREATE INDEX "auditorias_autor_id_criado_em_idx" ON "auditorias"("autor_id", "criado_em");

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
