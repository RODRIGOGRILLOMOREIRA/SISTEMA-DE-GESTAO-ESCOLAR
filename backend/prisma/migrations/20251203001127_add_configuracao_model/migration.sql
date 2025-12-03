-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "nomeEscola" TEXT NOT NULL,
    "redeEscolar" TEXT,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "temaModo" TEXT NOT NULL DEFAULT 'light',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);
