import { useEffect, useRef, useState } from 'react';
import { address } from '@solana/kit';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import programa from '../config/programa.json';
import { NEGOCIO_INICIAL, UNIDAD_MONTO } from '../config/interfaz';
import { leerRegistro, type RegistroUI } from '../solana/lecturas';
import { negocioValido } from '../solana/validaciones';
import { ErrorTransaccion, ErrorConfirmacionPendiente, enlaceTransaccion, traducir, type OpcionesEnvio } from '../solana/tx';
import { crearRegistro, crearCliente, registrarVenta, cambiarMonto, hacerDevolucion } from '../solana/acciones';

type Operacion = 'registro' | 'cliente' | 'venta' | 'monto' | 'devolucion';
const operaciones: { id: Operacion; texto: string }[] = [
  { id: 'registro', texto: 'Crear registro' }, { id: 'cliente', texto: 'Crear cliente' },
  { id: 'venta', texto: 'Registrar venta' }, { id: 'monto', texto: 'Corregir importe' },
  { id: 'devolucion', texto: 'Devolución' },
];

export function Registro({ onCambio, onOcupado }: { onCambio: () => void; onOcupado: (valor: boolean) => void }) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const walletDireccion = wallet.publicKey?.toBase58() ?? '';
  const [negocio, setNegocio] = useState(NEGOCIO_INICIAL);
  const [autoridad, setAutoridad] = useState(walletDireccion);
  const [registro, setRegistro] = useState<RegistroUI | null>(null);
  const [consultado, setConsultado] = useState(false);
  const [leyendo, setLeyendo] = useState(false);
  const [errorLectura, setErrorLectura] = useState('');
  const [op, setOp] = useState<Operacion>('registro');
  const [nombre, setNombre] = useState('Ana');
  const [idCliente, setIdCliente] = useState('1');
  const [sku, setSku] = useState('CAF01');
  const [descripcion, setDescripcion] = useState('Cafe americano');
  const [monto, setMonto] = useState('50');
  const [ocupado, setOcupado] = useState(false);
  const [fase, setFase] = useState('');
  const [firma, setFirma] = useState('');
  const [firmaFallida, setFirmaFallida] = useState('');
  const [errorOperacion, setErrorOperacion] = useState('');
  const [aviso, setAviso] = useState('');
  const contexto = useRef('');
  const secuencia = useRef(0);
  contexto.current = negocio + '|' + autoridad;

  useEffect(() => { setAutoridad(walletDireccion); }, [walletDireccion]);
  useEffect(() => {
    secuencia.current += 1; setRegistro(null); setConsultado(false); setErrorLectura('');
    setLeyendo(false); setFirma(''); setFirmaFallida(''); setErrorOperacion(''); setAviso('');
  }, [negocio, autoridad]);
  useEffect(() => { onOcupado(ocupado); return () => onOcupado(false); }, [ocupado, onOcupado]);

  async function cargar(nombreNegocio = negocio, owner = autoridad) {
    const clave = nombreNegocio + '|' + owner;
    const turno = ++secuencia.current;
    setLeyendo(true); setErrorLectura('');
    try {
      const datos = await leerRegistro(negocioValido(nombreNegocio), address(owner.trim()));
      if (turno === secuencia.current && contexto.current === clave) { setRegistro(datos); setConsultado(true); }
    } catch (error) {
      if (turno === secuencia.current) setErrorLectura(traducir(error));
      throw error;
    } finally { if (turno === secuencia.current) setLeyendo(false); }
  }

  async function ejecutar(evento: React.FormEvent) {
    evento.preventDefault();
    setOcupado(true); setFase('Preparando operación…'); setFirma(''); setFirmaFallida(''); setErrorOperacion(''); setAviso('');
    const nombreNegocio = negocio.trim();
    const direccionWallet = walletDireccion;
    const opciones: OpcionesEnvio = { onEstado: (estado) => setFase(estado === 'firma' ? 'Revisa la solicitud en tu wallet…' : 'Esperando confirmación de la red…') };
    try {
      const id = Number(idCliente), importe = Number(monto);
      let resultado: string;
      switch (op) {
        case 'registro': resultado = await crearRegistro(wallet, connection, nombreNegocio, opciones); break;
        case 'cliente': resultado = await crearCliente(wallet, connection, nombreNegocio, nombre, opciones); break;
        case 'venta': resultado = await registrarVenta(wallet, connection, nombreNegocio, id, sku, descripcion, importe, opciones); break;
        case 'monto': resultado = await cambiarMonto(wallet, connection, nombreNegocio, id, sku, importe, opciones); break;
        case 'devolucion': resultado = await hacerDevolucion(wallet, connection, nombreNegocio, id, sku, opciones); break;
      }
      setFirma(resultado); setFase('Operación confirmada correctamente.'); onCambio();
      try { await cargar(nombreNegocio, direccionWallet); }
      catch { setAviso('La operación se confirmó, pero no pudimos actualizar los datos. Pulsa Consultar registro para volver a leerlos.'); }
    } catch (error) {
      setFase(''); setErrorOperacion(traducir(error));
      if (error instanceof ErrorTransaccion || error instanceof ErrorConfirmacionPendiente) setFirmaFallida(error.firma);
    } finally { setOcupado(false); }
  }

  const esOtraAutoridad = !!autoridad.trim() && autoridad.trim() !== walletDireccion;
  const permiteEscribir = !programa.esReferencia && !!wallet.publicKey && !esOtraAutoridad;
  return <>
    <div className="section-heading"><div><p className="eyebrow">NEGOCIO · CLIENTES · VENTAS</p><h2>Tu registro de ventas</h2></div><span className="tag">Cuentas independientes</span></div>
    {programa.esReferencia && <aside className="notice information"><strong>Configura tu programa para comenzar.</strong><p>La aplicación incluye un IDL de referencia. Importa el exportado de tu despliegue para consultar el negocio y realizar operaciones. Las lecturas de saldo ya están disponibles en Conexión.</p></aside>}
    <section className="panel lookup-panel">
      <div className="panel-heading"><h3>Localizar el negocio</h3><span className="small-note">Lectura sin firma</span></div>
      <div className="lookup-fields"><label>Nombre exacto del negocio<input value={negocio} disabled={ocupado} onChange={(e) => setNegocio(e.target.value)} placeholder="Cafe WayLearn D1" /></label>
      <label>Dirección de la autoridad<input value={autoridad} disabled={ocupado} onChange={(e) => setAutoridad(e.target.value)} placeholder="Conecta tu wallet o pega una dirección pública" spellCheck={false} autoComplete="off" /></label>
      <button className="button secondary" disabled={leyendo || ocupado || programa.esReferencia || !negocio.trim() || !autoridad.trim()} onClick={() => void cargar().catch(() => {})}>{leyendo ? 'Consultando…' : 'Consultar registro'}</button></div>
      <p className="help">El nombre y la autoridad determinan la dirección del registro. Puedes consultar otra autoridad en modo lectura.</p>
      {errorLectura && <p className="notice error" role="alert">{errorLectura}</p>}
    </section>
    <div className="workspace-grid">
      <section className="panel customers-panel"><div className="panel-heading"><h3>Clientes y ventas</h3>{registro && <span className="count">{registro.clientes.length} clientes</span>}</div>
        {!registro ? <div className="empty-state"><span className="empty-symbol">◎</span><h4>{consultado ? 'El registro todavía no existe' : 'El negocio aparecerá aquí'}</h4><p>{consultado ? 'Comprueba el nombre y la autoridad, o crea un registro con tu wallet conectada.' : 'Consulta el registro para ver sus clientes y las ventas activas de cada uno.'}</p></div> : <>
          <div className="registry-summary"><div><span className="label">Negocio</span><strong>{registro.nombreNegocio}</strong></div><div><span className="label">Último ID asignado</span><strong>{registro.idCounter}</strong></div></div>
          <details className="technical-details"><summary>Dirección del registro</summary><code className="address">{registro.direccion}</code></details>
          {registro.clientes.length === 0 ? <p className="empty-line">Todavía no hay clientes. Puedes crear el primero desde Operaciones.</p> : registro.clientes.map((cliente) => <article className="customer" key={cliente.direccion}>
            <header><div><strong>{cliente.nombre}</strong><span className="small-note">Cliente #{cliente.idCliente} · {cliente.compras} ventas activas</span></div><button className="text-button" disabled={ocupado} onClick={() => { setIdCliente(String(cliente.idCliente)); setOp('venta'); }}>Seleccionar</button></header>
            {cliente.ventas.length === 0 ? <p className="empty-line">Sin ventas activas.</p> : <div className="table-wrap"><table><thead><tr><th>SKU</th><th>Descripción</th><th className="numeric">Importe</th></tr></thead><tbody>{cliente.ventas.map((venta) => <tr key={venta.direccion} onClick={() => { if (!ocupado) { setIdCliente(String(cliente.idCliente)); setSku(venta.sku); setMonto(String(venta.monto)); setOp('monto'); } }}><td><code>{venta.sku}</code></td><td>{venta.descripcion}</td><td className="numeric">{venta.monto.toLocaleString('es-MX')} <small>{UNIDAD_MONTO}</small></td></tr>)}</tbody></table></div>}
          </article>)}
        </>}
      </section>
      <section className="panel operations-panel"><div className="panel-heading"><h3>Operaciones</h3><span className="small-note">Con firma</span></div>
        <div className="operation-tabs">{operaciones.map((item) => <button key={item.id} className={op === item.id ? 'active' : ''} disabled={ocupado} onClick={() => { setOp(item.id); setFirma(''); setErrorOperacion(''); setFirmaFallida(''); setFase(''); }}>{item.texto}</button>)}</div>
        <form onSubmit={ejecutar}>
          <fieldset disabled={ocupado || !permiteEscribir}>
            {op === 'registro' && <p className="help">Crearás un registro para <strong>{negocio || 'tu negocio'}</strong> con la wallet conectada como autoridad.</p>}
            {op === 'cliente' && <label>Nombre del cliente<input value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>}
            {(op === 'venta' || op === 'monto' || op === 'devolucion') && <div className="two-fields"><label>ID del cliente<input type="number" min="1" max="65535" step="1" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required /></label><label>SKU<input value={sku} onChange={(e) => setSku(e.target.value)} required /></label></div>}
            {op === 'venta' && <label>Descripción<input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required /></label>}
            {(op === 'venta' || op === 'monto') && <label>{op === 'monto' ? 'Nuevo importe' : 'Importe'}<input type="number" min="1" max="4294967295" step="1" value={monto} onChange={(e) => setMonto(e.target.value)} required /><span className="help">Unidades enteras del ejercicio. No representa una transferencia de SOL.</span></label>}
            {op === 'devolucion' && <p className="notice subtle">Esta operación quita la venta del historial y cierra su cuenta. No realiza un reembolso comercial.</p>}
            <button className="button primary" type="submit" disabled={!negocio.trim()}>{ocupado ? 'Operación en curso…' : operaciones.find((item) => item.id === op)!.texto}</button>
          </fieldset>
        </form>
        {!wallet.publicKey && <p className="help">Conecta tu wallet de práctica para realizar operaciones.</p>}
        {esOtraAutoridad && wallet.publicKey && <p className="notice subtle">Estás consultando otra autoridad. Para escribir, utiliza el registro de la wallet conectada.</p>}
        {ocupado && <p className="notice information" role="status">{fase}</p>}
        {firma && <p className="notice success" role="status"><strong>Operación confirmada.</strong><br/><a href={enlaceTransaccion(firma)} target="_blank" rel="noreferrer">Ver transacción en Explorer</a></p>}
        {errorOperacion && <p className="notice error" role="alert">{errorOperacion}{firmaFallida && <><br/><a href={enlaceTransaccion(firmaFallida)} target="_blank" rel="noreferrer">Revisar transacción en Explorer</a></>}</p>}
        {aviso && <p className="notice subtle">{aviso}</p>}
      </section>
    </div>
  </>;
}
