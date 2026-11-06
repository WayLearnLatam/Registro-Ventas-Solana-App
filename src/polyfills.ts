/*
@solana/web3.js espera Buffer, que es de Node y no existe en el navegador.

Este archivo va importado PRIMERO en main.tsx y en su propio modulo a proposito:
los imports de un modulo se evaluan antes que su codigo, asi que una asignacion
escrita arriba de main.tsx correria DESPUES de que web3.js ya se cargo.
*/
import { Buffer } from "buffer";

globalThis.Buffer = globalThis.Buffer ?? Buffer;
