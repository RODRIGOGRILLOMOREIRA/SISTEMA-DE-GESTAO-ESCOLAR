# Script para baixar modelos do face-api.js
Write-Host "Baixando modelos de IA do face-api.js..." -ForegroundColor Green

$modelsDir = "public\models"
if (-not (Test-Path $modelsDir)) {
    New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null
}

$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

$files = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2",
    "face_expression_model-weights_manifest.json",
    "face_expression_model-shard1"
)

$downloadedCount = 0
$totalFiles = $files.Count

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $output = "$modelsDir\$file"
    
    try {
        Write-Host "Baixando $file..." -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop
        $downloadedCount++
        Write-Host " OK" -ForegroundColor Green
    }
    catch {
        Write-Host " ERRO" -ForegroundColor Red
        Write-Host "  Erro ao baixar $file : $_" -ForegroundColor Red
    }
}

Write-Host "`nDownload concluído: $downloadedCount/$totalFiles arquivos baixados" -ForegroundColor Cyan

if ($downloadedCount -eq $totalFiles) {
    Write-Host "Todos os modelos foram baixados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Alguns arquivos falharam. Tente executar o script novamente." -ForegroundColor Yellow
}
