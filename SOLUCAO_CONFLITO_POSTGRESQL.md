# ============================================
# SOLUÇÃO DO CONFLITO POSTGRESQL
# ============================================

## PROBLEMA IDENTIFICADO:
Dois PostgreSQL rodando na mesma porta 5432:
1. PostgreSQL Local Windows (Serviço: postgresql-x64-18)
2. PostgreSQL Docker (Container: sge-postgres)

O backend tenta conectar mas o Windows intercepta primeiro!

## SOLUÇÃO:

### Opção 1: Parar PostgreSQL Windows (RECOMENDADO)
```powershell
# Execute como Administrador:
Stop-Service -Name "postgresql-x64-18" -Force
Set-Service -Name "postgresql-x64-18" -StartupType Disabled
```

### Opção 2: Mudar porta do Docker
Editar docker-compose.yml:
```yaml
postgres:
  ports:
    - "5433:5432"  # Mudar porta externa
```

Editar backend/.env:
```
DATABASE_URL=postgresql://sge_user:sge_password@localhost:5433/sge_db
POSTGRES_PORT=5433
```

### Opção 3: Usar IP direto do container Docker
```bash
docker inspect sge-postgres | findstr "IPAddress"
```

Usar IP no DATABASE_URL em vez de localhost

## RECOMENDAÇÃO FINAL:
Parar o PostgreSQL Windows pois não está sendo usado e causa conflito.
O Docker tem os dados corretos e senha válida.
