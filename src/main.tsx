import "./polyfills"; // primero, antes de cualquier import de Solana

import React from "react";
import ReactDOM from "react-dom/client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import { ENDPOINT } from "./solana/conexion";
import App from "./App";
import "./index.css";

/*
Tres providers, de afuera hacia adentro:

  ConnectionProvider   la conexion de web3.js que el wallet adapter necesita para
                       firmar. Nuestras lecturas no pasan por aqui: van por el rpc
                       de @solana/kit (src/solana/conexion.ts).

  WalletProvider       descubre las wallets. wallets={[]} esta vacio A PROPOSITO:
                       el adapter detecta solo las que soportan Wallet Standard
                       (Phantom, Solflare, Backpack...) y estan instaladas en el
                       navegador. La app no nombra ninguna wallet; el usuario
                       llega con la suya.

  WalletModalProvider  la ventana para elegir wallet y el boton que la abre.
*/
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={ENDPOINT}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
