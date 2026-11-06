import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validarIdl, huellaIdl } from './contrato-idl.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const idl = JSON.parse(await readFile(resolve(root, 'idl.json'), 'utf8'));
  const configuracion = JSON.parse(await readFile(resolve(root, 'src/config/programa.json'), 'utf8'));
  const datos = validarIdl(idl);
  const generado = await readFile(resolve(root, 'clients/js/src/generated/programs/registro.ts'), 'utf8');
  if (configuracion.programId !== datos.programId || configuracion.idlSha256 !== huellaIdl(idl) || !generado.includes('"' + datos.programId + '"')) {
    throw new Error('El IDL cambio o el cliente generado no coincide. Ejecuta npm run cliente antes de iniciar o compilar.');
  }
  console.log('Contrato coherente: IDL, Program ID y cliente generado.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
