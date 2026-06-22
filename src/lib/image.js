// Lê um ficheiro de imagem, reduz para no máximo `maxSize` px no lado maior e
// devolve { image (base64 sem prefixo), mediaType }. Mantém o upload pequeno
// (importante para os limites das serverless functions).
export function fileToResizedBase64(file, maxSize = 1024, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width >= height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve({ image: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Imagem inválida.'));
    };
    img.src = url;
  });
}
