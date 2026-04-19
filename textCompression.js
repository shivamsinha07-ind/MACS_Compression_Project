export async function compressPNG(file) {
  if (!file || file.size === 0) {
    throw new Error("File is empty or missing.");
  }

  if (!file.type.includes("png")) {
    throw new Error("Only PNG files supported.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      try {
        const originalData = new Uint8Array(e.target.result);
        const originalSize = originalData.length;
        
        const png = UPNG.decode(originalData);
        const compressedData = UPNG.encode(png.frames, png.width, png.height, 3, png.colors);
        const compressedSize = compressedData.length;
        const compressionRatio = (originalSize / compressedSize).toFixed(2);
        const spaceSavings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);
        
        const compressedBlob = new Blob([compressedData], { type: 'image/png' });
        
        resolve({
          compressedBlob,
          originalSize,
          compressedSize,
          compressionRatio,
          spaceSavings,
          algorithm: "PNG Optimizer (UPNG.js)",
          noGain: compressedSize >= originalSize
        });
      } catch (error) {
        reject(new Error(`PNG compression failed: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PNG file'));
    reader.readAsArrayBuffer(file);
  });
}

export async function decompressPNG(compressedFile) {
  const arrayBuffer = await compressedFile.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < pngSignature.length; i++) {
    if (data[i] !== pngSignature[i]) {
      throw new Error('Invalid PNG data');
    }
  }
  
  return compressedFile;
}
