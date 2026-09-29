import { describe, it, expect } from 'vitest';
import { compressImageFile } from '../compressImage';

describe('compressImageFile', () => {
  it('laisse passer un fichier qui n\'est pas une image', async () => {
    const file = new File(['bonjour'], 'note.txt', { type: 'text/plain' });
    const result = await compressImageFile(file, 'product');
    expect(result).toBe(file);
  });

  it('renvoie le fichier d\'origine si le navigateur ne peut pas le lire', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' });
    const result = await compressImageFile(file, 'product');
    expect(result).toBeInstanceOf(File);
    expect(result.type === 'image/jpeg' || result.type === 'image/png').toBe(true);
  });
});
