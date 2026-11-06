import { address, createNoopSigner, type Address } from '@solana/kit';
import type { Connection } from '@solana/web3.js';
import {
  getCrearRegistroInstruction, getCrearClienteInstruction,
  getRegistrarVentaInstruction, getCambiarMontoInstruction, getHacerDevolucionInstruction,
} from '../../clients/js/src/generated';
import { cadena, pdaCliente, pdaRegistro } from './pdas';
import { siguienteId } from './lecturas';
import { enviar, type WalletFirma, type OpcionesEnvio } from './tx';
import { comprobarConfiguracion } from './seguridad';
import { negocioValido, nombreValido, skuValido, descripcionValida, idValido, montoValido } from './validaciones';

export function direccionDe(wallet: Pick<WalletFirma, 'publicKey'>): Address {
  if (!wallet.publicKey) throw new Error('Conecta tu wallet primero.');
  return address(wallet.publicKey.toBase58());
}

function firmante(wallet: WalletFirma) {
  comprobarConfiguracion();
  // Representa la identidad que la wallet firmará después; no contiene claves.
  // Los roles finales los establece el builder generado del cliente actual.
  return createNoopSigner(direccionDe(wallet));
}

/** Ejemplo resuelto: identidad, cuentas, instrucción y envío. */
export async function crearRegistro(wallet: WalletFirma, connection: Connection, nombreNegocio: string, opciones?: OpcionesEnvio): Promise<string> {
  nombreNegocio = negocioValido(nombreNegocio);
  const owner = firmante(wallet);
  const registro = pdaRegistro(nombreNegocio, owner.address);
  const ix = getCrearRegistroInstruction({ owner, registro, nombreNegocio });
  return enviar(ix, wallet, connection, opciones);
}

/** Ejercicio 1 del día 4: crear la cuenta Cliente y actualizar Registro. */
export async function crearCliente(wallet: WalletFirma, connection: Connection, nombreNegocio: string, nombre: string, opciones?: OpcionesEnvio): Promise<string> {
  // TODO 1: sigue el patron del ejemplo crearRegistro.
  // Consulta docs/DIA-4.md y el tipo Input de la instruccion generada.
  throw new Error("Ejercicio 1 pendiente: completa crearCliente en src/solana/acciones.ts.");
}

/** Ejercicio 2: mismo patrón con una Venta que depende del Cliente. */
export async function registrarVenta(wallet: WalletFirma, connection: Connection, nombreNegocio: string, idCliente: number, sku: string, descripcion: string, monto: number, opciones?: OpcionesEnvio): Promise<string> {
  // TODO 2: sigue el patron del ejemplo crearRegistro.
  // Consulta docs/DIA-4.md y el tipo Input de la instruccion generada.
  throw new Error("Ejercicio 2 pendiente: completa registrarVenta en src/solana/acciones.ts.");
}

export async function cambiarMonto(wallet: WalletFirma, connection: Connection, nombreNegocio: string, idCliente: number, sku: string, nuevoMonto: number, opciones?: OpcionesEnvio): Promise<string> {
  nombreNegocio = negocioValido(nombreNegocio);
  idCliente = idValido(idCliente);
  sku = skuValido(sku);
  nuevoMonto = montoValido(nuevoMonto);
  const owner = firmante(wallet);
  const { registro, cliente, venta } = cadena(nombreNegocio, owner.address, idCliente, sku);
  const ix = getCambiarMontoInstruction({ owner, registro, cliente, venta, idCliente, sku, nuevoMonto });
  return enviar(ix, wallet, connection, opciones);
}

export async function hacerDevolucion(wallet: WalletFirma, connection: Connection, nombreNegocio: string, idCliente: number, sku: string, opciones?: OpcionesEnvio): Promise<string> {
  nombreNegocio = negocioValido(nombreNegocio);
  idCliente = idValido(idCliente);
  sku = skuValido(sku);
  const owner = firmante(wallet);
  const { registro, cliente, venta } = cadena(nombreNegocio, owner.address, idCliente, sku);
  const ix = getHacerDevolucionInstruction({ owner, registro, cliente, venta, idCliente, sku });
  return enviar(ix, wallet, connection, opciones);
}
