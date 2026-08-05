// @ts-nocheck
// JPEG EXIF orientation nikalta hai taake rotated photos sahi aayein
// @ts-nocheck
export const readOrientation = (file: Blob | File): Promise<number> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) !== 0xffd8) return resolve(1);
      const len = view.byteLength;
      let off = 2;
      while (off < len) {
        const marker = view.getUint16(off, false); off += 2;
        if (marker === 0xffe1) {
          const exifOff = off + 2;
          const little = view.getUint16(exifOff + 2, false) === 0x4949;
          const tags = view.getUint16(exifOff + 8, little);
          for (let i = 0; i < tags; i++) {
            const t = exifOff + 10 + i * 12;
            if (view.getUint16(t, little) === 0x0112) return resolve(view.getUint16(t + 8, little));
          }
          return resolve(1);
        } else if ((marker & 0xff00) === 0xff00) {
          off += view.getUint16(off, false);
        } else break;
      }
      resolve(1);
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
  });
}
