import { PublicKey } from '@solana/web3.js';

// Estos bytes corresponden al programa del bootcamp. El IDL de referencia no
// describe esas semillas; este helper conserva su correspondencia explícita.
export const s = {
  texto: (valor: string) => Buffer.from(valor, 'utf8'),
  cuenta: (valor: { toString(): string }) => new PublicKey(valor.toString()).toBuffer(),
  u16: (valor: number) => {
    if (!Number.isInteger(valor) || valor < 0 || valor > 65_535) throw new Error('El identificador no cabe en u16.');
    const bytes = Buffer.alloc(2);
    bytes.writeUInt16LE(valor, 0);
    return bytes;
  },
};
