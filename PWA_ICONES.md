# 📱 Instruções para Ícones PWA

## Ícones Necessários

Para completar a configuração PWA, você precisa adicionar os seguintes ícones na pasta `frontend/public/`:

### 1. pwa-192x192.png
- Dimensões: 192x192 pixels
- Formato: PNG
- Propósito: Ícone padrão para dispositivos móveis

### 2. pwa-512x512.png
- Dimensões: 512x512 pixels
- Formato: PNG
- Propósito: Ícone de alta resolução e splash screen

### 3. apple-touch-icon.png (opcional)
- Dimensões: 180x180 pixels
- Formato: PNG
- Propósito: Ícone para dispositivos iOS

### 4. favicon.ico (opcional)
- Dimensões: 32x32 pixels
- Formato: ICO
- Propósito: Favicon do navegador

## Como Criar os Ícones

### Opção 1: Usando Ferramentas Online
1. Acesse: https://realfavicongenerator.net/
2. Faça upload de uma imagem do logo (mínimo 512x512px)
3. Clique em "Generate favicons"
4. Baixe o pacote gerado
5. Extraia os arquivos para `frontend/public/`

### Opção 2: Usando Photoshop/GIMP
1. Abra o logo da escola
2. Redimensione para 512x512px (mantendo proporções)
3. Salve como PNG: `pwa-512x512.png`
4. Redimensione para 192x192px
5. Salve como PNG: `pwa-192x192.png`

### Opção 3: Usando ImageMagick (CLI)
```bash
# Assumindo que você tem um logo.png de alta resolução
convert logo.png -resize 512x512 pwa-512x512.png
convert logo.png -resize 192x192 pwa-192x192.png
convert logo.png -resize 180x180 apple-touch-icon.png
```

## Estrutura Final

Após adicionar os ícones, a pasta `frontend/public/` deve conter:

```
frontend/public/
├── pwa-192x192.png
├── pwa-512x512.png
├── apple-touch-icon.png (opcional)
├── favicon.ico (opcional)
└── models/ (já existente)
```

## Testando o PWA

### Desktop (Chrome/Edge)
1. Abra o projeto: `npm run dev`
2. Acesse: http://localhost:5173
3. Clique no ícone de instalação na barra de endereços
4. Siga as instruções de instalação

### Mobile
1. Abra o navegador no celular
2. Acesse o IP do servidor (ex: http://192.168.1.100:5173)
3. Menu > "Adicionar à tela inicial"

### Verificando Service Worker
1. Abra DevTools (F12)
2. Aba "Application" (Chrome) ou "Depurar" (Edge)
3. Seção "Service Workers"
4. Verifique se o worker está registrado e ativo

## Teste Offline

1. Com o app aberto, desconecte a internet
2. Navegue pelas páginas
3. Assets (CSS, JS, imagens) devem carregar do cache
4. APIs tentarão buscar da rede primeiro, depois cache

## Troubleshooting

### PWA não instala
- Verifique se está usando HTTPS (ou localhost)
- Confirme que os ícones existem em `public/`
- Verifique console do DevTools para erros

### Service Worker não registra
- Limpe o cache do navegador
- Desregistre service workers antigos no DevTools
- Reinicie o servidor de desenvolvimento

### Ícones não aparecem
- Confirme que os nomes dos arquivos estão corretos
- Verifique as dimensões (exatamente 192x192 e 512x512)
- Limpe o cache e recarregue

---

**Nota:** Os ícones são o único requisito manual restante. Todo o resto (service worker, manifest, cache) já está configurado automaticamente!
