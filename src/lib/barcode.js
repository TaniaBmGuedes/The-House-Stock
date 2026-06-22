import { BrowserMultiFormatReader } from '@zxing/browser';

// Descodifica um código de barras a partir de um ficheiro de imagem (foto da
// câmara). Funciona em http (não usa getUserMedia). Lança se não encontrar.
export async function decodeBarcodeFromFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const reader = new BrowserMultiFormatReader();
    const result = await reader.decodeFromImageUrl(url);
    return result.getText();
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Procura o produto pelo código no Open Food Facts (base gratuita, com CORS).
// Devolve { name, brand, packageSize, image } ou null se não existir.
export async function lookupBarcode(code) {
  const fields = 'product_name,product_name_pt,brands,quantity,image_front_url';
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    code
  )}.json?fields=${fields}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  return {
    name: p.product_name_pt || p.product_name || '',
    brand: (p.brands || '').split(',')[0].trim(),
    packageSize: (p.quantity || '').trim(),
    image: p.image_front_url || '',
  };
}
