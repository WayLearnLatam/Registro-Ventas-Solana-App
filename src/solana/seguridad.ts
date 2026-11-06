import type { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import programa from '../config/programa.json';
import { REGISTRO_PROGRAM_ADDRESS } from '../../clients/js/src/generated';

// Hash completo de Devnet, no el identificador CAIP-2 truncado.
export const DEVNET_GENESIS = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';

export function comprobarConfiguracion() {
  if (programa.esReferencia) throw new Error('Importa el IDL de tu programa para habilitar las operaciones. Consulta docs/IDL-Y-PLAYGROUND.md.');
  if (programa.programId !== String(REGISTRO_PROGRAM_ADDRESS)) {
    throw new Error('El IDL y el cliente generado no corresponden. Ejecuta npm run cliente.');
  }
}

export async function comprobarDevnet(connection: Pick<Connection, 'getGenesisHash'>) {
  const genesis = await connection.getGenesisHash();
  if (genesis !== DEVNET_GENESIS) throw new Error('Este proyecto solo permite escribir en Devnet. Revisa el RPC antes de continuar.');
}

export async function comprobarPrograma(connection: Connection) {
  comprobarConfiguracion();
  await comprobarDevnet(connection);
  const cuenta = await connection.getAccountInfo(new PublicKey(REGISTRO_PROGRAM_ADDRESS), 'confirmed');
  if (!cuenta?.executable) throw new Error('El programa indicado no está desplegado en este RPC de Devnet. Revisa el Program ID y tu despliegue.');
}
