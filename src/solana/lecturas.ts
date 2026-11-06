import type { Address } from "@solana/kit";

import {
  fetchAllCliente,
  fetchAllVenta,
  fetchMaybeRegistro,
} from "../../clients/js/src/generated";
import { rpc } from "./conexion";
import { pdaRegistro } from "./pdas";

/*
LECTURAS — ya resueltas

Leer no necesita wallet ni firma: solo el rpc. Estas funciones vienen escritas
para que el dia 4 puedas concentrarte en la escritura.

Fijate en la forma del resultado: fetchX devuelve { address, data, lamports... }
y los campos de la cuenta estan dentro de .data, nunca sueltos en la raiz.
*/

export type ClienteUI = {
  direccion: Address;
  idCliente: number;
  nombre: string;
  compras: number;
  ventas: { direccion: Address; sku: string; descripcion: string; monto: number }[];
};

export type RegistroUI = {
  direccion: Address;
  nombreNegocio: string;
  idCounter: number;
  clientes: ClienteUI[];
};

/*
Tres niveles de cuentas, tres niveles de lectura: el registro guarda las
direcciones de sus clientes, y cada cliente las de sus ventas. Esa es la
contrapartida del modelo: una cuenta por entidad se paga con una lectura
por entidad.

fetchMaybe... no lanza si la cuenta no existe: devuelve exists: false. Es lo
que quieres cuando el usuario todavia no ha creado su registro.
*/
export async function leerRegistro(
  nombreNegocio: string,
  owner: Address
): Promise<RegistroUI | null> {
  const direccion = pdaRegistro(nombreNegocio, owner);
  const cuenta = await fetchMaybeRegistro(rpc, direccion);

  if (!cuenta.exists) return null;

  const clientes = await fetchAllCliente(rpc, cuenta.data.clientes);

  const conVentas = await Promise.all(
    clientes.map(async (c) => {
      const ventas = await fetchAllVenta(rpc, c.data.historial);
      return {
        direccion: c.address,
        idCliente: c.data.idCliente,
        nombre: c.data.nombre,
        compras: c.data.compras,
        ventas: ventas.map((v) => ({
          direccion: v.address,
          sku: v.data.sku,
          descripcion: v.data.descripcion,
          monto: v.data.monto,
        })),
      };
    })
  );

  return {
    direccion,
    nombreNegocio: cuenta.data.nombreNegocio,
    idCounter: cuenta.data.idCounter,
    clientes: conVentas,
  };
}

/*
El id del cliente nuevo sale del contador del registro.

El programa es quien lo asigna; esta lectura no se lo manda. Hace falta porque
el id entra en las semillas, y una transaccion de Solana declara por adelantado
todas las cuentas que va a tocar: hay que saber la direccion ANTES de firmar.
*/
export async function siguienteId(
  nombreNegocio: string,
  owner: Address
): Promise<number> {
  const cuenta = await fetchMaybeRegistro(rpc, pdaRegistro(nombreNegocio, owner));
  if (!cuenta.exists) throw new Error("Ese registro no existe todavia.");
  if (cuenta.data.clientes.length >= 10) throw new Error("El registro alcanzó las 10 referencias de clientes previstas para el ejercicio.");
  if (cuenta.data.idCounter >= 65_535) throw new Error("Se agotaron los identificadores u16 del registro.");
  return cuenta.data.idCounter + 1;
}
