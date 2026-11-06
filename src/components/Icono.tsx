export function Icono({ tipo }: { tipo: 'conexion' | 'registro' | 'vacio' }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {tipo === 'conexion' ? <><path d="M7 17 17 7M7 7h10v10" /><path d="M5 12v7h7" /></> : tipo === 'registro' ? <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></> : <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>}
  </svg>;
}
