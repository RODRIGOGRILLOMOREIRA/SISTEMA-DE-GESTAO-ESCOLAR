# Script para corrigir TODOS os nomes de modelo Prisma

Write-Host "🔧 Iniciando correção de nomes de modelo..." -ForegroundColor Cyan

$replacements = @{
    # Modelos em camelCase que devem ser snake_case
    'prisma\.calendarioEscolar' = 'prisma.calendario_escolar'
    'prisma\.eventoCalendario' = 'prisma.eventos_calendario'
    'prisma\.disciplinaTurma' = 'prisma.disciplinas_turmas'
    'prisma\.equipeDiretiva' = 'prisma.equipe_diretiva'
    'prisma\.frequencia(?!s)' = 'prisma.frequencias'  # Não substitui 'frequencias'
    'prisma\.funcionario(?!s)' = 'prisma.funcionarios'  # Não substitui 'funcionarios'
    'prisma\.gradeHoraria' = 'prisma.grade_horaria'
    'prisma\.horarioAula' = 'prisma.horarios_aula'
    'prisma\.registroFrequencia' = 'prisma.registro_frequencia'
    'prisma\.presencaAluno' = 'prisma.PresencaAluno'  # Este mantém camelCase
    'prisma\.matricula(?!s)' = 'prisma.matriculas'
    'prisma\.nota(?!s)' = 'prisma.notas'
    'prisma\.notasFinal' = 'prisma.notas_finais'
    'prisma\.notaFinal' = 'prisma.notas_finais'
}

$files = Get-ChildItem "backend/src/routes/*.routes.ts"
$totalChanges = 0

foreach ($file in $files) {
    Write-Host "`n📄 Processando: $($file.Name)" -ForegroundColor Yellow
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanges = 0
    
    foreach ($pattern in $replacements.Keys) {
        $replacement = $replacements[$pattern]
        $matches = [regex]::Matches($content, $pattern)
        
        if ($matches.Count -gt 0) {
            $content = $content -replace $pattern, $replacement
            $fileChanges += $matches.Count
            Write-Host "  ✓ $pattern → $replacement ($($matches.Count)x)" -ForegroundColor Green
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -NoNewline
        $totalChanges += $fileChanges
        Write-Host "  💾 Salvo com $fileChanges alterações" -ForegroundColor Cyan
    } else {
        Write-Host "  ✓ Nenhuma alteração necessária" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Concluído! Total de alterações: $totalChanges" -ForegroundColor Green
Write-Host "🔄 Reinicie o backend para aplicar as mudanças" -ForegroundColor Yellow
