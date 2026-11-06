import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modo = process.argv[2];
const modos = { dia3: 'resuelto', dia4: 'ejercicio', resuelto: 'resuelto' };
try {
  if (!(modo in modos)) throw new Error('Selecciona dia3, dia4 o resuelto.');
  const destino = resolve(root, 'src/solana/acciones.ts');
  const nuevo = resolve(root, 'materiales/acciones-' + modos[modo] + '.ts.txt');
  const [actual, siguiente] = await Promise.all([readFile(destino, 'utf8'), readFile(nuevo, 'utf8')]);
  if (actual !== siguiente) {
    const carpeta = resolve(root, '.aula/respaldos');
    await mkdir(carpeta, { recursive: true });
    await copyFile(destino, resolve(carpeta, 'acciones-' + Date.now() + '.ts'));
    await writeFile(destino, siguiente);
  }
  await writeFile(resolve(root, 'src/config/aula.json'), JSON.stringify({ modo, pantallaInicial: modo === 'dia3' ? 'conexion' : 'registro' }, null, 2) + '\n');
  console.log('Material preparado: ' + modo + '. El IDL, el cliente generado y el programa se conservaron.');
  console.log('Los cambios previos de acciones.ts se respaldan en .aula/respaldos.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
