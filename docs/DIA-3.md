# Día 3 · Wallet, RPC y cliente generado

## Preparación del instructor

Usa el mismo frontend que continuaremos el día 4. Antes de clase, importa el IDL real y publica esa configuración junto con el cliente. La interfaz ya está en React; no hay que migrar un HTML entre sesiones.

```bash
npm run clase:dia3
npm run dev
```

Este modo abre Conexión y reserva la pantalla Registro para la siguiente sesión. Las funciones resueltas se conservan como referencia; hoy no se recorre su integración.

## Ruta sugerida para 75–90 minutos

| Tiempo orientativo | Qué explicar o demostrar |
| --- | --- |
| 0–10 min | Del programa de los días 1–2 a un cliente en el navegador. Localizar `main.tsx`, componentes y `src/solana`. |
| 10–25 min | Conectar la wallet, dirección pública y diferencia entre conectar y firmar. El código no recibe su clave privada. |
| 25–40 min | RPC de Devnet, consulta de un saldo público y manejo de una dirección inválida. Leer no necesita firma. |
| 40–55 min | IDL exportado, Program ID y relación con el código Rust. Ver una instrucción y una estructura de cuenta en el JSON. |
| 55–70 min | Ejecutar `npm run cliente`, localizar lo generado y examinar el constructor de `crearRegistro`. |
| 70–90 min | Recapitular el flujo, dudas y comprobar que cada participante tiene la app y el cliente listos. |

Para una sesión de 60 minutos, entrega la instalación resuelta antes de empezar y recorta la navegación por archivos. Mantén la demo de wallet/RPC y la generación del cliente.

## Archivos para mostrar

1. `src/main.tsx`: proveedores de conexión y wallet; tratarlo como infraestructura preparada.
2. `src/solana/conexion.ts`: un endpoint común para lecturas y escrituras.
3. `src/solana/saldo.ts`: dirección → petición RPC → lamports → SOL.
4. `idl.json`: contrato del programa.
5. `clients/js/src/generated/instructions/crearRegistro.ts`: cuentas y argumentos tipados.

No es necesario escribir el cliente generado ni enseñar todos los genéricos TypeScript. Distingue el código que producimos con Codama del que conectaremos con la interfaz.

## Seguridad dentro de la demo

- No introducir claves privadas en variables de entorno ni en el frontend.
- Mostrar que leer otra dirección no solicita firma.
- Comprobar Devnet con el RPC; cambiar una etiqueta visual no cambia la red.
- Explicar que el IDL debe corresponder al programa realmente desplegado.

## Punto de llegada

Wallet reconocida o diagnóstico del navegador, lectura pública de saldo y cliente generado. El siguiente día conectamos instrucciones con los formularios del mismo proyecto.
