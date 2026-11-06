import { createSolanaRpc } from "@solana/kit";

/*
Un solo lugar para la red y para el objeto de lectura.

En este proyecto conviven dos SDK de Solana, y cada uno tiene su trabajo:

  rpc (@solana/kit)      LEER la cadena. Es el SDK nuevo, y es el que usa el
                         cliente que vas a generar con codama.
  connection (web3.js)   la pide el wallet adapter para FIRMAR. Vive dentro del
                         ConnectionProvider de main.tsx y no hace falta tocarla.

Las dos apuntan al mismo endpoint. Si cambias de red, se cambia aqui.
*/
export const ENDPOINT = import.meta.env.VITE_SOLANA_RPC_URL?.trim() || "https://api.devnet.solana.com";

export const rpc = createSolanaRpc(ENDPOINT);
