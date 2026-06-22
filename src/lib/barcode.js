import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

// Leitor com TRY_HARDER e restrito aos formatos de retalho (mais fiável a
// localizar o código numa foto com fundo).
function buildReader() {
  const hints = new Map();
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.ITF,
  ]);
  return new BrowserMultiFormatReader(hints);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Imagem inválida.'));
    };
    img.src = url;
  });
}

// Desenha a imagem rodada `deg` graus num canvas (limita o lado maior por
// desempenho, mantendo detalhe suficiente para as barras).
function toCanvas(img, deg, max = 2400) {
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const swap = deg === 90 || deg === 270;
  const canvas = document.createElement('canvas');
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  return canvas;
}

// Descodifica um código de barras a partir de uma foto. Tenta várias rotações
// (a foto pode estar inclinada/em pé). Funciona em http (não usa getUserMedia).
export async function decodeBarcodeFromFile(file) {
  const img = await loadImage(file);
  const reader = buildReader();
  for (const deg of [0, 90, 270, 180]) {
    try {
      const result = reader.decodeFromCanvas(toCanvas(img, deg));
      if (result) return result.getText();
    } catch {
      // não encontrou nesta orientação — tenta a próxima
    }
  }
  throw new Error('Código não encontrado.');
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
