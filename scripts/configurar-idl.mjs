import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validarIdl } from './contrato-idl.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const args = process.argv.slice(2);
  const archivo = args[0];
  if (!archivo || archivo.startsWith('--')) throw new Error('Uso: npm run configurar:idl -- /ruta/al/idl.json [--program-id TU_PROGRAM_ID]');
  const posicionId = args.indexOf('--program-id');
  const programId = posicionId < 0 ? undefined : args[posicionId + 1];
  if (posicionId >= 0 && !programId) throw new Error('Falta el valor de --program-id.');
  const idl = JSON.parse(await readFile(resolve(archivo), 'utf8'));
  const datos = validarIdl(idl, programId);
  if (!idl.address && !idl.metadata?.address) idl.metadata = { ...idl.metadata, address: datos.programId };
  await mkdir(resolve(root, '.aula/respaldos'), { recursive: true });
  const marca = new Date().toISOString().replace(/[:.]/g, '-');
  const anterior = await readFile(resolve(root, 'idl.json'), 'utf8');
  await writeFile(resolve(root, '.aula/respaldos/idl-' + marca + '.json'), anterior);
  await writeFile(resolve(root, 'idl.json'), JSON.stringify(idl, null, 2) + '\n');
  const resultado = spawnSync(process.execPath, [resolve(root, 'scripts/generar-cliente.mjs'), '--idl-importado'], { cwd: root, stdio: 'inherit' });
  if (resultado.status !== 0) throw new Error('El IDL quedo importado, pero la generacion fallo. Su respaldo anterior esta en .aula/respaldos.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
