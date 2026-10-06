-- CreateEnum
CREATE TYPE "EstadoConvite" AS ENUM ('PENDENTE', 'ACEITO', 'ENVIO_FALHOU');

-- DropForeignKey
ALTER TABLE "contas_autenticacao" DROP CONSTRAINT "contas_autenticacao_usuario_id_fkey";

-- DropTable
DROP TABLE "contas_autenticacao";

-- DropTable
DROP TABLE "tokens_verificacao";

-- Usuários já existentes recebem um nome não vazio antes da restrição.
UPDATE "usuarios" SET "name" = split_part("email", '@', 1) WHERE "name" IS NULL OR btrim("name") = '';

-- AlterTable
ALTER TABLE "usuarios"
    DROP COLUMN "email_verificado",
    DROP COLUMN "image",
    ALTER COLUMN "name" SET NOT NULL,
    ADD COLUMN "password_hash" TEXT,
    ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "estado_convite" "EstadoConvite" NOT NULL DEFAULT 'PENDENTE',
    ADD COLUMN "credencial_expira_em" TIMESTAMP(3),
    ADD COLUMN "convite_enviado_em" TIMESTAMP(3),
    ADD COLUMN "convite_aceito_em" TIMESTAMP(3);

-- Sessões internas continuam usando token armazenado somente por hash.
ALTER TABLE "sessoes" ADD COLUMN "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
