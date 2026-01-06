# 📊 Guia de Importação de Calendário Escolar via Excel

## 🎯 Visão Geral

O sistema agora suporta importação de eventos do calendário escolar diretamente de arquivos Excel (.xls ou .xlsx), facilitando a configuração do ano letivo de 2026.

## 📋 Formato do Excel

### Estrutura Esperada

O arquivo Excel deve ter **3 colunas principais** (os nomes podem variar):

| Data       | Tipo               | Descrição                    |
|------------|--------------------|-----------------------------|
| 01/02/2026 | Início Ano Letivo  | Início das aulas de 2026    |
| 21/06/2026 | Recesso            | Festa Junina                |
| 25/12/2026 | Feriado            | Natal                       |

### 📌 Coluna 1: Data

A coluna de data pode estar em diversos formatos:

- **Formato brasileiro**: `DD/MM/YYYY` (ex: 15/03/2026)
- **Formato numérico do Excel**: `45678` (serial date)
- **Formato ISO**: `2026-03-15`

**Nomes aceitos para a coluna:**
- Data
- Dia
- Date
- Ou qualquer nome contendo "data" ou "dia"

### 📝 Coluna 2: Tipo de Evento

Tipos reconhecidos automaticamente (case-insensitive):

| Texto no Excel | Tipo no Sistema |
|----------------|-----------------|
| Início Ano Letivo / Inicio do Ano | INICIO_ANO_LETIVO |
| Fim Ano Letivo / Fim do Ano | FIM_ANO_LETIVO |
| Dia Letivo / Aula / Letivo | DIA_LETIVO |
| Dia Não Letivo / Não Letivo | DIA_NAO_LETIVO |
| Parada Pedagógica / Parada | PARADA_PEDAGOGICA |
| Recesso / Férias | RECESSO |
| Sábado Letivo | SABADO_LETIVO |
| Feriado | FERIADO |
| Início Trimestre / Início 1º Trimestre | INICIO_TRIMESTRE |
| Fim Trimestre / Fim 1º Trimestre | FIM_TRIMESTRE |
| Período EAC / EAC | PERIODO_EAC |
| Qualquer outro texto | OUTRO |

**Nomes aceitos para a coluna:**
- Tipo
- Type
- Evento
- Ou qualquer nome contendo "tipo" ou "evento"

### 💬 Coluna 3: Descrição (Opcional)

Campo livre para detalhes adicionais do evento.

**Nomes aceitos para a coluna:**
- Descrição
- Descricao
- Descrição do Evento
- Observação
- Obs
- Desc
- Ou qualquer nome contendo "descr" ou "obs"

## 📥 Como Importar

### Passo 1: Preparar o Excel

1. Abra seu arquivo Excel com o calendário de 2026
2. Certifique-se de que as 3 colunas estão presentes
3. Verifique se as datas estão corretas
4. Salve o arquivo (.xlsx ou .xls)

### Passo 2: Acessar o Sistema

1. Faça login no sistema
2. Navegue até **Calendário Escolar**
3. Selecione o ano **2026** usando os botões de navegação

### Passo 3: Importar

1. Clique no botão **"Importar Excel"** (botão verde com ícone de upload)
2. Leia as instruções no modal
3. **Opção importante**: Marque a caixa "Substituir eventos existentes" se quiser remover todos os eventos do ano 2026 antes de importar
4. Clique em **"Selecionar Arquivo Excel"**
5. Escolha seu arquivo .xlsx ou .xls
6. Aguarde o processamento

### Passo 4: Verificar

- O sistema mostrará quantos eventos foram importados
- Os eventos aparecerão automaticamente organizados por categoria
- Você pode editar ou excluir eventos individuais se necessário

## ✅ Exemplo de Excel Válido

```
Data        | Tipo                  | Descrição
------------|----------------------|---------------------------
03/02/2026  | Início Ano Letivo    | Início das aulas 2026
10/04/2026  | Parada Pedagógica    | Formação de professores
21/04/2026  | Feriado              | Tiradentes
23/04/2026  | Recesso              | Recesso de Páscoa
01/05/2026  | Feriado              | Dia do Trabalho
23/06/2026  | Recesso              | Festa Junina
07/09/2026  | Feriado              | Independência do Brasil
12/10/2026  | Feriado              | Nossa Senhora Aparecida
02/11/2026  | Feriado              | Finados
15/11/2026  | Feriado              | Proclamação da República
25/12/2026  | Feriado              | Natal
20/12/2026  | Fim Ano Letivo       | Encerramento do ano letivo
```

## 🔄 Opções de Importação

### Adicionar aos Existentes (Padrão)

- Os novos eventos serão **adicionados** aos já cadastrados
- Eventos duplicados podem aparecer
- Use quando quiser complementar o calendário

### Substituir Eventos Existentes

- **Remove todos** os eventos do ano selecionado
- Depois importa os novos eventos do Excel
- Use quando quiser recriar o calendário do zero

## ⚠️ Problemas Comuns

### "Nenhum evento válido foi encontrado"

**Causas possíveis:**
- Colunas com nomes muito diferentes (renomeie para "Data", "Tipo", "Descrição")
- Formato de data inválido
- Planilha vazia ou dados em abas diferentes

**Solução:**
- Verifique se os dados estão na primeira aba
- Certifique-se de que as datas são válidas
- Use os nomes de colunas sugeridos

### Datas aparecem erradas

**Causa:**
- Excel usando formato de data diferente

**Solução:**
- Formate as células de data como "Data" no Excel
- Ou use texto no formato DD/MM/YYYY

### Tipos de eventos aparecem como "Outro"

**Causa:**
- Texto do tipo não corresponde aos reconhecidos

**Solução:**
- Use os tipos da tabela de referência acima
- Após importar, você pode editar os eventos individualmente

## 📱 Acesso Mobile

A importação também funciona no celular:
1. Tenha o arquivo Excel no seu celular (Google Drive, OneDrive, etc.)
2. Acesse o sistema pelo navegador móvel
3. Toque em "Importar Excel"
4. Selecione o arquivo do gerenciador de arquivos

## 🎨 Visualização Após Importação

Os eventos serão automaticamente organizados em **5 categorias**:

1. **Ano Letivo** - Início e fim do ano
2. **Trimestres** - Início, fim e períodos de avaliação
3. **Dias Especiais** - Dias letivos, não letivos, sábados letivos, paradas
4. **Feriados e Recessos** - Feriados nacionais/municipais e recessos
5. **Outros** - Eventos diversos

Cada categoria tem uma cor específica para fácil visualização.

## 💡 Dicas Importantes

1. **Backup**: Antes de substituir eventos, considere exportar os dados atuais
2. **Teste**: Faça um teste com poucos eventos primeiro
3. **Revisão**: Após importar, revise os eventos para garantir que estão corretos
4. **Datas**: O Excel às vezes formata datas de forma estranha - verifique
5. **Encoding**: Use UTF-8 se tiver problemas com acentos

## 🚀 Benefícios

- ⏱️ **Economia de tempo**: Importe centenas de eventos em segundos
- 📊 **Facilidade**: Use o Excel que você já conhece
- 🔄 **Flexibilidade**: Atualize o calendário facilmente
- ✅ **Confiabilidade**: O sistema valida e processa automaticamente
- 📱 **Mobilidade**: Funciona no computador e no celular

## 📞 Suporte

Se encontrar problemas:
1. Verifique este guia primeiro
2. Confira o formato do Excel
3. Tente com um arquivo menor de teste
4. Entre em contato com o administrador do sistema

---

**Última atualização**: Janeiro de 2026
**Versão**: 1.0
