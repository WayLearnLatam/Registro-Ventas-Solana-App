import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { obtenerSaldo } from '../solana/saldo';
import { traducir } from '../solana/tx';
import { Icono } from './Icono';

const formato = (saldo: number) => saldo.toLocaleString('es-MX', { maximumFractionDigits: 9 });

export function Conexion({ revision }: { revision: number }) {
  const { publicKey } = useWallet();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);
  useEffect(() => {
    let activo = true;
    setSaldo(null); setError('');
    if (publicKey) obtenerSaldo(publicKey.toBase58()).then((valor) => { if (activo) setSaldo(valor); }).catch((e) => { if (activo) setError(traducir(e)); });
    return () => { activo = false; };
  }, [publicKey, revision, recarga]);

  return <>
    <div className="section-heading"><div><p className="eyebrow">EXPLORAR SOLANA</p><h2>Conexión y saldos</h2></div><span className="tag">Lecturas públicas</span></div>
    <div className="two-columns">
      <section className="panel">
        <div className="panel-heading"><h3>Tu wallet</h3><span className="status-dot" data-on={!!publicKey} /></div>
        {publicKey ? <>
          <p className="label">Dirección de Solana</p><code className="address">{publicKey.toBase58()}</code>
          <p className="balance">{saldo === null ? '—' : formato(saldo)} <span>SOL de prueba</span></p>
          <button className="button secondary" onClick={() => setRecarga((valor) => valor + 1)}>Actualizar saldo</button>
        </> : <div className="empty-state"><span className="empty-symbol"><Icono tipo="conexion" /></span><h4>Conecta tu wallet de práctica</h4><p>Utiliza el botón de la parte superior. Después podrás consultar su saldo y autorizar operaciones en Devnet.</p></div>}
        {error && <p className="notice error" role="alert">{error}</p>}
      </section>
      <SaldoPublico />
    </div>
    <aside className="explanation"><strong>Leer y firmar son acciones distintas.</strong><p>Consultar una dirección pública no requiere conectar una wallet. Para modificar el registro, la autoridad correspondiente deberá firmar.</p><a href="https://faucet.solana.com/" target="_blank" rel="noreferrer">Obtener SOL de prueba</a></aside>
  </>;
}

function SaldoPublico() {
  const [direccion, setDireccion] = useState('');
  const [saldo, setSaldo] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  async function consultar(evento: React.FormEvent) {
    evento.preventDefault(); setCargando(true); setError(''); setSaldo(null);
    try { setSaldo(await obtenerSaldo(direccion)); } catch (e) { setError(traducir(e)); } finally { setCargando(false); }
  }
  return <section className="panel"><div className="panel-heading"><h3>Consultar otra dirección</h3><span className="small-note">Sin firma</span></div>
    <p className="muted">Pega una dirección pública de Solana y consulta su saldo mediante el RPC.</p>
    <form onSubmit={consultar}>
      <label>Dirección pública<input value={direccion} disabled={cargando} onChange={(e) => { setDireccion(e.target.value); setSaldo(null); setError(''); }} placeholder="Dirección en base58" autoComplete="off" spellCheck={false} required /></label>
      <button className="button" disabled={cargando || !direccion.trim()}>{cargando ? 'Consultando…' : 'Consultar saldo'}</button>
    </form>
    {saldo !== null && <p className="public-balance">{formato(saldo)} <span>SOL</span></p>}
    {error && <p className="notice error" role="alert">{error}</p>}
  </section>;
}
