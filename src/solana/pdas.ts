import { address, type Address } from "@solana/kit";
import { PublicKey } from "@solana/web3.js";

import { REGISTRO_PROGRAM_ADDRESS } from "../../clients/js/src/generated";
import { s } from "./seeds";

/*
DERIVACION DE PDAs

El Program ID sale del cliente generado, que a su vez lo saco de TU idl.json.
No hay ninguna direccion escrita a mano en el proyecto.

findProgramAddressSync devuelve un PublicKey (web3.js) y el cliente de Codama
espera un Address (@solana/kit). derivar() hace esa conversion en un solo lugar,
para que el resto del codigo trabaje con un solo tipo.
*/
const PROGRAM_ID = new PublicKey(REGISTRO_PROGRAM_ADDRESS);

function derivar(semillas: Buffer[]): Address {
  const [pda] = PublicKey.findProgramAddressSync(semillas, PROGRAM_ID);
  return address(pda.toBase58());
}

// Rust: seeds = [b"registro", nombre_negocio.as_bytes(), owner.key().as_ref()]
export function pdaRegistro(nombreNegocio: string, owner: Address) {
  return derivar([s.texto("registro"), s.texto(nombreNegocio), s.cuenta(owner)]);
}

// Rust: seeds = [b"cliente", registro.key().as_ref(), id_cliente.to_le_bytes()]
export function pdaCliente(registro: Address, idCliente: number) {
  return derivar([s.texto("cliente"), s.cuenta(registro), s.u16(idCliente)]);
}

// Rust: seeds = [b"venta", cliente.key().as_ref(), sku.as_bytes()]
export function pdaVenta(cliente: Address, sku: string) {
  return derivar([s.texto("venta"), s.cuenta(cliente), s.texto(sku)]);
}

/*
Las tres instrucciones de venta necesitan las tres cuentas, porque el programa
valida la cadena completa en el contexto. Derivarlas de una vez evita repetir
el mismo bloque.
*/
export function cadena(
  nombreNegocio: string,
  owner: Address,
  idCliente: number,
  sku: string
) {
  const registro = pdaRegistro(nombreNegocio, owner);
  const cliente = pdaCliente(registro, idCliente);
  const venta = pdaVenta(cliente, sku);
  return { registro, cliente, venta };
}
