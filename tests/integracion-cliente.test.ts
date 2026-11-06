import '../src/polyfills';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { PublicKey } from '@solana/web3.js';
import type { Connection } from '@solana/web3.js';
import { address, createNoopSigner } from '@solana/kit';
import { getRegistrarVentaInstruction, getRegistrarVentaInstructionDataDecoder, getCambiarMontoInstruction, REGISTRO_PROGRAM_ADDRESS } from '../clients/js/src/generated';
import { pdaRegistro, pdaCliente, pdaVenta } from '../src/solana/pdas';
import { s } from '../src/solana/seeds';
import { aWeb3, confirmarEnvio, ErrorTransaccion, ErrorConfirmacionPendiente, traducir } from '../src/solana/tx';
import { comprobarDevnet, DEVNET_GENESIS } from '../src/solana/seguridad';
import { montoValido, skuValido, nombreValido, idValido } from '../src/solana/validaciones';
import idl from '../idl.json';
import { validarIdl, prepararIdl, REFERENCIA_ID } from '../scripts/contrato-idl.mjs';

// Direccion publica de fixture. No se crean wallets ni se envian transacciones.
const owner = address(new PublicKey(new Uint8Array(32).fill(7)).toBase58());

test('las semillas u16 conservan dos bytes little-endian y sus limites', () => {
  assert.deepEqual([...s.u16(256)], [0, 1]);
  assert.deepEqual([...s.u16(65_535)], [255, 255]);
  assert.throws(() => s.u16(65_536));
  assert.throws(() => s.u16(1.5));
});

test('Registro, Cliente y Venta coinciden con las semillas del programa Rust', () => {
  const programa = new PublicKey(REGISTRO_PROGRAM_ADDRESS);
  const [registro] = PublicKey.findProgramAddressSync([Buffer.from('registro'), Buffer.from('Cafe WayLearn D1'), new PublicKey(owner).toBuffer()], programa);
  const id = Buffer.alloc(2); id.writeUInt16LE(256);
  const [cliente] = PublicKey.findProgramAddressSync([Buffer.from('cliente'), registro.toBuffer(), id], programa);
  const [venta] = PublicKey.findProgramAddressSync([Buffer.from('venta'), cliente.toBuffer(), Buffer.from('CAF01')], programa);
  assert.equal(pdaRegistro('Cafe WayLearn D1', owner), registro.toBase58());
  assert.equal(pdaCliente(address(registro.toBase58()), 256), cliente.toBase58());
  assert.equal(pdaVenta(address(cliente.toBase58()), 'CAF01'), venta.toBase58());
});

test('Codama serializa la instruccion y el puente conserva datos, orden y roles', () => {
  const registro = pdaRegistro('Cafe', owner), cliente = pdaCliente(registro, 1), venta = pdaVenta(cliente, 'CAF01');
  const ix = getRegistrarVentaInstruction({ owner: createNoopSigner(owner), registro, cliente, venta, idCliente: 1, sku: 'CAF01', descripcion: 'Cafe americano', monto: 50 });
  const esperado = createHash('sha256').update('global:registrar_venta').digest().subarray(0, 8);
  assert.deepEqual(Buffer.from(ix.data.subarray(0, 8)), esperado);
  assert.equal(getRegistrarVentaInstructionDataDecoder().decode(ix.data).monto, 50);
  const convertida = aWeb3(ix);
  assert.equal(convertida.programId.toBase58(), REGISTRO_PROGRAM_ADDRESS);
  assert.deepEqual(convertida.data, Buffer.from(ix.data));
  assert.deepEqual(convertida.keys.map((cuenta) => [cuenta.isSigner, cuenta.isWritable]), [[true, true], [false, false], [false, true], [false, true], [false, false]]);
  const correccion = aWeb3(getCambiarMontoInstruction({ owner: createNoopSigner(owner), registro, cliente, venta, idCliente: 1, sku: 'CAF01', nuevoMonto: 55 }));
  assert.equal(correccion.keys[0].isSigner, true);
  assert.equal(correccion.keys[0].isWritable, false);
});

test('una confirmacion con error nunca produce un resultado de exito', async () => {
  const estrategia = { signature: 'firma-de-prueba', blockhash: 'blockhash-de-prueba', lastValidBlockHeight: 123 };
  const connection = { confirmTransaction: async () => ({ context: { slot: 1 }, value: { err: { InstructionError: [0, { Custom: 6000 }] } } }) } as unknown as Pick<Connection, 'confirmTransaction'>;
  await assert.rejects(confirmarEnvio(connection, estrategia), (error: unknown) => error instanceof ErrorTransaccion && error.firma === estrategia.signature);
  const correcta = { confirmTransaction: async (_datos: unknown, commitment: string) => { assert.equal(commitment, 'confirmed'); return { context: { slot: 1 }, value: { err: null } }; } } as unknown as Pick<Connection, 'confirmTransaction'>;
  assert.equal(await confirmarEnvio(correcta, estrategia), estrategia.signature);
});

test('se exige el genesis completo de Devnet para escribir', async () => {
  await comprobarDevnet({ getGenesisHash: async () => DEVNET_GENESIS });
  await assert.rejects(comprobarDevnet({ getGenesisHash: async () => '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d' }), /solo permite escribir en Devnet/);
  await assert.rejects(comprobarDevnet({ getGenesisHash: async () => DEVNET_GENESIS.slice(0, 32) }));
});

test('una interrupcion del RPC conserva la firma y no afirma que la transaccion fallo', async () => {
  const estrategia = { signature: 'firma-ya-enviada', blockhash: 'blockhash', lastValidBlockHeight: 123 };
  const connection = { confirmTransaction: async () => { throw new Error('RPC timeout'); } } as unknown as Pick<Connection, 'confirmTransaction'>;
  await assert.rejects(confirmarEnvio(connection, estrategia), (error: unknown) => error instanceof ErrorConfirmacionPendiente && error.firma === estrategia.signature && /antes de repetirla/.test(error.message));
});

test('validaciones de UI comprueban bytes UTF-8 y enteros positivos', () => {
  assert.equal(skuValido('CAF01'), 'CAF01');
  assert.throws(() => skuValido('Cafe☕'));
  assert.equal(nombreValido(' Ana '), 'Ana');
  for (const invalido of [0, -1, 1.5, NaN, 4_294_967_296]) assert.throws(() => montoValido(invalido));
  assert.equal(montoValido(4_294_967_295), 4_294_967_295);
  assert.throws(() => idValido(65_536));
});

test('los errores distinguen cancelacion, autoridad, semillas y RPC', () => {
  assert.match(traducir(new Error('User rejected the request')), /cancelada/);
  assert.match(traducir(new Error('custom program error: 0x1770')), /NoOwner/);
  assert.match(traducir(new Error('custom program error: 0x7d6')), /ConstraintSeeds/);
  assert.match(traducir(new Error('429 Too Many Requests')), /RPC/);
});

test('se valida el contrato IDL y la normalizacion no cambia el orden ni tipos', () => {
  const copia = structuredClone(idl);
  if ('address' in copia) delete (copia as unknown as Record<string, unknown>).address;
  copia.metadata = { ...copia.metadata, address: REFERENCIA_ID };
  assert.equal(validarIdl(copia).esReferencia, true);
  const ix = copia.instructions.find((item) => item.name.toLowerCase().replace(/_/g, '') === 'registrarventa')!;
  ix.args[0].name = '_id_cliente';
  assert.equal(validarIdl(copia).programId, REFERENCIA_ID);
  const normalizada = prepararIdl(copia, REFERENCIA_ID);
  assert.equal(normalizada.instructions.find((item: { name: string }) => item.name === ix.name).args[0].name, 'id_cliente');
  assert.equal(ix.args[0].name, '_id_cliente');
  const invalida = structuredClone(copia); invalida.instructions = [];
  assert.throws(() => validarIdl(invalida), /Falta la instruccion/);
  const otroTipo = structuredClone(copia);
  otroTipo.instructions[0].args[0].type = 'u64';
  assert.throws(() => validarIdl(otroTipo), /tipos de los argumentos/);
  const otraCuenta = structuredClone(copia) as unknown as { accounts: { name: string; type?: { fields: unknown[] } }[]; types?: { name: string; type: { fields: unknown[] } }[] };
  const cuenta = otraCuenta.accounts[0];
  const esquema = cuenta.type ?? otraCuenta.types?.find((item) => item.name === cuenta.name)?.type;
  esquema!.fields.reverse();
  assert.throws(() => validarIdl(otraCuenta), /campos de la cuenta/);
  assert.throws(() => validarIdl(copia, new PublicKey(new Uint8Array(32).fill(9)).toBase58()), /no coinciden/);
});
