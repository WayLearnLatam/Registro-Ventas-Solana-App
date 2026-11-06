import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Conexion } from './components/Conexion';
import { Registro } from './components/Registro';
import { Icono } from './components/Icono';
import aula from './config/aula.json';
import programa from './config/programa.json';
import { TITULO_APP } from './config/interfaz';
import { ENDPOINT } from './solana/conexion';
import { comprobarDevnet } from './solana/seguridad';

export default function App() {
  const [vista, setVista] = useState<'conexion' | 'registro'>(aula.pantallaInicial === 'conexion' ? 'conexion' : 'registro');
  const [revision, setRevision] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const { publicKey } = useWallet();
  const [red, setRed] = useState('Verificando RPC…');
  const [errorRed, setErrorRed] = useState(false);
  const { connection } = useConnection();
  useEffect(() => {
    let activo = true;
    comprobarDevnet(connection).then(() => { if (activo) { setRed('Devnet verificada'); setErrorRed(false); } }).catch(() => { if (activo) { setRed('Revisa la conexión RPC'); setErrorRed(true); } });
    return () => { activo = false; };
  }, [connection]);
  const soloDia3 = aula.modo === 'dia3';
  return <div className="app-layout">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(e) => e.preventDefault()}><span className="brand-mark">W</span><span>WayLearn<span className="brand-caption">SOLANA ENGINEERING TRACK</span></span></a>
      <p className="sidebar-label">REGISTRO DE VENTAS</p>
      <nav aria-label="Secciones de la aplicación">
        <button className={vista === 'conexion' ? 'nav-item selected' : 'nav-item'} disabled={ocupado} onClick={() => setVista('conexion')}><Icono tipo="conexion" /> Conexión</button>
        <button className={vista === 'registro' ? 'nav-item selected' : 'nav-item'} disabled={ocupado || soloDia3} onClick={() => setVista('registro')}><Icono tipo="registro" /> Registro de ventas{soloDia3 && <small>Día 4</small>}</button>
      </nav>
      <div className="sidebar-bottom"><p>Aprende construyendo.</p><span>Datos de práctica · Solana Devnet</span><a href="https://github.com/WayLearnLatam" target="_blank" rel="noreferrer">Comunidad y recursos</a></div>
    </aside>
    <div className="main-area">
      <header className="topbar"><div><span className="topbar-title">{TITULO_APP}</span><span className={errorRed ? 'network-badge warning' : 'network-badge'}>{red}</span></div><WalletMultiButton>{publicKey ? publicKey.toBase58().slice(0, 4) + '…' + publicKey.toBase58().slice(-4) : 'Conectar wallet'}</WalletMultiButton></header>
      <main>
        {vista === 'conexion' ? <Conexion revision={revision} /> : <Registro onCambio={() => setRevision((valor) => valor + 1)} onOcupado={setOcupado} />}
        <footer className="app-footer"><span>RPC: {new URL(ENDPOINT).hostname}</span><details><summary>{programa.esReferencia ? 'Programa de referencia' : 'Programa configurado'}</summary><code className="address">{programa.programId}</code></details></footer>
      </main>
    </div>
  </div>;
}
