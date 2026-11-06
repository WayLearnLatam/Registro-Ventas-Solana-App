import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validarIdl, prepararIdl, huellaIdl } from './contrato-idl.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const idl = JSON.parse(await readFile(resolve(root, 'idl.json'), 'utf8'));
  const datos = validarIdl(idl);
  const idlSha256 = huellaIdl(idl);
  let anterior;
  try { anterior = JSON.parse(await readFile(resolve(root, 'src/config/programa.json'), 'utf8')); } catch { /* Primera generacion. */ }
  // Una importacion explicita puede confirmar el despliegue de David aunque
  // coincida con la direccion de muestra. Conservar esa decision al regenerar.
  const importado = process.argv.includes('--idl-importado') || (
    anterior?.esReferencia === false && anterior.programId === datos.programId && anterior.idlSha256 === idlSha256
  );
  datos.esReferencia = datos.esReferencia && !importado;
  await mkdir(resolve(root, '.aula'), { recursive: true });
  await writeFile(resolve(root, '.aula/idl-codama.json'), JSON.stringify(prepararIdl(idl, datos.programId), null, 2) + '\n');
  const paqueteRuta = resolve(root, 'node_modules/codama/package.json');
  const paquete = JSON.parse(await readFile(paqueteRuta, 'utf8'));
  const bin = typeof paquete.bin === 'string' ? paquete.bin : paquete.bin.codama;
  const resultado = spawnSync(process.execPath, [resolve(dirname(paqueteRuta), bin), 'run', 'js'], { cwd: root, stdio: 'inherit' });
  if (resultado.status !== 0) throw new Error('Codama no pudo generar el cliente. Revisa la salida anterior.');
  // El cliente vive dentro de este proyecto ESM y se consume como TypeScript.
  // Codama crea otro package.json: fijamos su modo para Vite y Node/tsx.
  const clienteRuta = resolve(root, 'clients/js/package.json');
  const cliente = JSON.parse(await readFile(clienteRuta, 'utf8'));
  cliente.type = 'module';
  cliente.private = true;
  cliente.main = './src/generated/index.ts';
  delete cliente.scripts?.test;
  await writeFile(clienteRuta, JSON.stringify(cliente, null, 2) + '\n');
  await writeFile(resolve(root, 'src/config/programa.json'), JSON.stringify({
    ...datos,
    origen: datos.esReferencia ? 'IDL de referencia de David. Escritura bloqueada.' : 'IDL importado por el participante.',
    idlSha256,
  }, null, 2) + '\n');
  console.log(datos.esReferencia
    ? 'Cliente de referencia generado. Importa tu IDL para habilitar escrituras en Devnet.'
    : 'Cliente generado para ' + datos.programId + '. Reinicia Vite si ya estaba abierto.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
