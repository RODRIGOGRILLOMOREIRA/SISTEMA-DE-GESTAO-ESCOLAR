# Sistema de Cálculo de Notas - Documentação

## 📐 Fórmula de Cálculo da Nota Final

### Fórmula Oficial
```
Nota Final = (T1 × 3 + T2 × 3 + T3 × 4) ÷ 10
```

Onde:
- **T1** = Nota Final do 1º Trimestre
- **T2** = Nota Final do 2º Trimestre  
- **T3** = Nota Final do 3º Trimestre

### Pesos por Trimestre
- 1º Trimestre: **peso 3** (30%)
- 2º Trimestre: **peso 3** (30%)
- 3º Trimestre: **peso 4** (40%)

**Total: 10** (100%)

### ⚠️ Lógica de Médias Parciais (Cálculo Proporcional)

**As médias são calculadas considerando APENAS os trimestres lançados:**

- **Apenas T1 lançado**: Média Parcial = **T1** (valor do 1º trimestre)
- **T1 e T2 lançados**: Média Parcial = **(T1×3 + T2×3) ÷ 6** (mantém proporção 3:3)
- **T1, T2 e T3 lançados**: Média Final = **(T1×3 + T2×3 + T3×4) ÷ 10** (completa)

---

## 🔢 Exemplos de Cálculo

### Exemplo 1: Aluno com todas as notas
```
T1 = 8.0
T2 = 7.5
T3 = 9.0

Nota Final = (8.0×3 + 7.5×3 + 9.0×4) ÷ 10
Nota Final = (24 + 22.5 + 36) ÷ 10
Nota Final = 82.5 ÷ 10
Nota Final = 8.25
```
**Status: ✅ APROVADO** (≥ 7.0)

### Exemplo 2: Aluno com notas médias
```
T1 = 6.0
T2 = 6.5
T3 = 7.0

Nota Final = (6.0×3 + 6.5×3 + 7.0×4) ÷ 10
Nota Final = (18 + 19.5 + 28) ÷ 10
Nota Final = 65.5 ÷ 10
Nota Final = 6.55
```
**Status: ⚠️ RECUPERAÇÃO** (5.0 - 6.9)

### Exemplo 3: Aluno com dificuldades
```
T1 = 5.0
T2 = 4.5
T3 = 5.5

Nota Final = (5.0×3 + 4.5×3 + 5.5×4) ÷ 10
Nota Final = (15 + 13.5 + 22) ÷ 10
Nota Final = 50.5 ÷ 10
Nota Final = 5.05
```
**Status: ⚠️ RECUPERAÇÃO** (5.0 - 6.9)

### Exemplo 4: Aluno reprovado
```
T1 = 4.0
T2 = 3.5
T3 = 4.5

Nota Final = (4.0×3 + 3.5×3 + 4.5×4) ÷ 10
Nota Final = (12 + 10.5 + 18) ÷ 10
Nota Final = 40.5 ÷ 10
Nota Final = 4.05
```
**Status: ❌ REPROVADO** (< 5.0)

---

## 📊 Cálculos em Tempo Real

O sistema sempre utiliza a **mesma fórmula base** para qualquer cálculo:

### **Fórmula Única: (T1×3 + T2×3 + T3×4) ÷ 10**

> ⚠️ **Trimestres não lançados são considerados como zero**

---

### Situação 1: Apenas 1º Trimestre lançado
```
T1 = 7.5
T2 = 0 (não lançado)
T3 = 0 (não lançado)

Média Parcial = (7.5×3 + 0×3 + 0×4) ÷ 10
Média Parcial = (22.5 + 0 + 0) ÷ 10
Média Parcial = 22.5 ÷ 10
Média Parcial = 2.25

Texto exibido: "Média Parcial (T1): 2.25"
```

### Situação 2: 1º e 2º Trimestre lançados
```
T1 = 7.5
T2 = 8.0
T3 = 0 (não lançado)

Média Parcial = (7.5×3 + 8.0×3 + 0×4) ÷ 10
Média Parcial = (22.5 + 24 + 0) ÷ 10
Média Parcial = 46.5 ÷ 10
Média Parcial = 4.65

Texto exibido: "Média Parcial (T1+T2): 4.65"
```

### Situação 3: Todos os trimestres lançados
```
T1 = 7.5
T2 = 8.0
T3 = 8.5

Nota Final = (7.5×3 + 8.0×3 + 8.5×4) ÷ 10
Nota Final = (22.5 + 24 + 34) ÷ 10
Nota Final = 80.5 ÷ 10
Nota Final = 8.05

Texto exibido: "Média Final: 8.05"
```

---

## ⚠️ Observação Importante sobre Médias Parciais

Quando **apenas T1 ou T1+T2** estão lançados, o valor da média parcial será **menor** que as notas dos trimestres lançados. **Isso é correto!**

### Por quê?
- A fórmula sempre divide por **10 (total de pesos do ano)**
- Com apenas T1: `(T1×3 + 0 + 0) ÷ 10` = apenas 30% do valor de T1
- Com T1+T2: `(T1×3 + T2×3 + 0) ÷ 10` = apenas 60% da média de T1 e T2

### Exemplo Visual:
```
Se T1 = 8.0:
  Média Parcial = (8.0×3) ÷ 10 = 24 ÷ 10 = 2.4
  (Isso representa 30% da nota final potencial)

Se T1 = 8.0 e T2 = 8.0:
  Média Parcial = (8.0×3 + 8.0×3) ÷ 10 = 48 ÷ 10 = 4.8
  (Isso representa 60% da nota final potencial)

Se T1 = 8.0, T2 = 8.0 e T3 = 8.0:
  Nota Final = (8.0×3 + 8.0×3 + 8.0×4) ÷ 10 = 80 ÷ 10 = 8.0
  (Agora temos 100% da nota final)
```

---

## 🎯 Critérios de Aprovação

### Status Final
O status é determinado automaticamente pela nota final:

| Nota Final | Status | Cor | Ícone |
|------------|--------|-----|-------|
| ≥ 7.0 | ✅ APROVADO | Verde | ✓ |
| 5.0 - 6.9 | ⚠️ RECUPERAÇÃO | Amarelo | ⚠ |
| < 5.0 | ❌ REPROVADO | Vermelho | ✗ |

### Observações
- A nota mínima para aprovação direta é **7.0**
- Alunos com média entre **5.0 e 6.9** vão para recuperação
- Alunos com média abaixo de **5.0** são reprovados
- Além da nota, é necessário **75% de frequência** mínima

---

## 📝 Cálculo das Notas por Trimestre

Cada trimestre possui sua própria estrutura de avaliação:

### Momento 1 (M1)
```
Média M1 = Avaliação 01 + Avaliação 02 + Avaliação 03
```

### Nota Final do Trimestre
```
Nota Final Trimestre = MAIOR entre (Média M1, Avaliação EAC)
```

**Explicação:**
- O aluno faz 3 avaliações regulares (somadas)
- Depois faz a Avaliação EAC (Experiência de Aprendizagem Complementar)
- A nota final do trimestre é a **maior** entre M1 e EAC
- Isso dá ao aluno uma segunda chance de melhorar

---

## 🔄 Implementação Técnica

### Frontend (React)
```typescript
const calcularMediaParcialAno = () => {
  const t1 = notaFinal?.trimestre1
  const t2 = notaFinal?.trimestre2
  const t3 = notaFinal?.trimestre3

  // Sempre usa a mesma fórmula: (T1×3 + T2×3 + T3×4) / 10
  // Trimestres não lançados são considerados como 0
  const valor1 = t1 ?? 0
  const valor2 = t2 ?? 0
  const valor3 = t3 ?? 0
  
  const media = parseFloat(((valor1 * 3 + valor2 * 3 + valor3 * 4) / 10).toFixed(2))
  
  // Se tem trimestre 3, exibe como Média Final
  if (t3 !== null && t3 !== undefined) {
    return { valor: media, texto: 'Média Final' }
  }
  
  // Se tem trimestre 2, exibe como Média Parcial (T1+T2)
  if (t2 !== null && t2 !== undefined) {
    return { valor: media, texto: 'Média Parcial (T1+T2)' }
  }
  
  // Se tem apenas trimestre 1, exibe como Média Parcial (T1)
  if (t1 !== null && t1 !== undefined) {
    return { valor: media, texto: 'Média Parcial (T1)' }
  }
  
  return { valor: null, texto: 'Média Parcial do Ano' }
}
```

### Backend (Node.js)
```typescript
function calcularMediaFinal(
  t1: number | null, 
  t2: number | null, 
  t3: number | null
): number | null {
  if (t1 !== null && t2 !== null && t3 !== null) {
    const mediaFinal = (t1 * 3 + t2 * 3 + t3 * 4) / 10
    return parseFloat(mediaFinal.toFixed(2))
  }
  return null
}
```

---

## 📋 Validações

### Validações Implementadas
- ✅ Notas devem estar entre 0 e 10
- ✅ Valores decimais são aceitos (ex: 7.5, 8.25)
- ✅ Cálculo automático em tempo real
- ✅ Arredondamento para 2 casas decimais
- ✅ Validação de campos obrigatórios
- ✅ Cores dinâmicas por faixa de nota

### Interface
- ✅ Exibição da fórmula na tela
- ✅ Cores diferenciadas por status
- ✅ Atualização automática ao salvar
- ✅ Mensagens de feedback claras
- ✅ Loading states durante salvamento

---

## 🎓 Fluxo Completo

### 1. Professor Lança Notas
1. Seleciona Turma
2. Seleciona Aluno
3. Seleciona Disciplina
4. Escolhe o Trimestre
5. Lança as 3 avaliações regulares
6. Sistema calcula Média M1 automaticamente
7. Lança Avaliação EAC
8. Sistema calcula Nota Final do Trimestre
9. Salva no banco de dados

### 2. Sistema Calcula Média Parcial
- Após salvar cada trimestre
- Calcula automaticamente
- Atualiza interface em tempo real
- Exibe status parcial

### 3. Sistema Calcula Média Final
- Quando 3 trimestres estão lançados
- Aplica fórmula (T1×3 + T2×3 + T3×4) ÷ 10
- Define status final
- Disponibiliza para boletim

### 4. Geração de Boletim
- Busca todas as notas do aluno
- Calcula média final de cada disciplina
- Verifica frequência
- Gera PDF com todas as informações
- Inclui fórmula utilizada no rodapé

---

## 🔍 Troubleshooting

### Problema: Nota final não aparece
**Solução:** Verifique se os 3 trimestres foram lançados

### Problema: Cálculo parece errado
**Solução:** Confirme a fórmula: (T1×3 + T2×3 + T3×4) ÷ 10

### Problema: Status não atualiza
**Solução:** Salve as notas e recarregue a página

### Problema: Cores não aparecem
**Solução:** Verifique se as notas estão salvas no banco

---

## 📅 Histórico de Alterações

### v1.1.0 - 02/01/2026
- ✅ Corrigida fórmula de cálculo da média final
- ✅ Implementado cálculo em tempo real
- ✅ Atualizada interface com nova fórmula
- ✅ Documentação completa criada

### v1.0.0 - Implementação Inicial
- ✅ Sistema de lançamento de notas
- ✅ Cálculo por trimestre
- ✅ Geração de boletins
- ✅ Interface de cores

---

**Última atualização:** 02/01/2026  
**Versão:** 1.1.0  
**Desenvolvido por:** Sistema de Gestão Escolar
