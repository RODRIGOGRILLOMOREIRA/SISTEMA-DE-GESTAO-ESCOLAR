// Wrapper para carregamento lazy do face-api.js
let faceApiModule: typeof import('face-api.js') | null = null;

export async function loadFaceApi() {
  if (!faceApiModule) {
    console.log('🔄 Carregando face-api.js dinamicamente...');
    faceApiModule = await import('face-api.js');
    console.log('✅ face-api.js carregado com sucesso!');
  }
  return faceApiModule;
}

export function isFaceApiLoaded() {
  return faceApiModule !== null;
}
