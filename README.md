# Registro de ventas · Solana Engineering Track Advanced

Aplicación educativa de WayLearn para conectar una wallet, consultar Solana Devnet y operar el programa `registro` de los días 1 y 2. Se utiliza en las sesiones de frontend de los días 3 y 4 y como base del día 5.

> **Empieza aquí:** [Guía para Isaac](GUIA_PARA_ISAAC.md). El proyecto incluye un IDL de referencia para poder instalar, generar el cliente y estudiar la estructura. **Las operaciones del registro permanecen bloqueadas hasta importar el IDL del despliegue que se utilizará en clase.** La conexión y la consulta pública de saldos funcionan desde el inicio.

## Qué incluye

- Conexión de wallets compatibles con Wallet Standard, mediante Wallet Adapter.
- Consulta de saldos públicos por RPC, sin solicitar firmas.
- Lectura del negocio, sus clientes y las ventas activas.
- Crear registro, crear cliente, registrar venta, corregir importe y hacer devolución.
- Derivación de PDAs, cliente generado con Codama, firma, confirmación y mensajes de error.
- Modos de clase para separar la explicación del día 3 de los ejercicios del día 4.
- Configuración de Dev Container y guías para preparar la sesión.

**El importe es un entero del ejercicio. Registrar una venta no cobra tokens ni SOL.** La devolución elimina la referencia y cierra la cuenta Venta; no ejecuta un reembolso comercial.

## Ruta principal: GitHub Codespaces

1. Sube estos archivos a la raíz de un repositorio. Incluye `.devcontainer`, `.gitignore`, `.nvmrc`, `idl.json`, `clients/` y `package-lock.json`.
2. En GitHub: **Code → Codespaces → Create codespace on main**.
3. Espera a que termine la preparación. El contenedor utiliza Node 22 y ejecuta `npm ci` y `npm run cliente`.
4. En la terminal del Codespace:

```bash
npm run dev
```

5. En **Ports / Puertos**, abre el puerto **5173** con **Open in Browser**. Utiliza una pestaña normal del navegador donde esté instalada tu wallet, en lugar de la vista incrustada del editor.

El puerto puede permanecer privado. Si GitHub pide autenticar el acceso, utiliza la misma cuenta con la que abriste el Codespace. Detén el Codespace al terminar de trabajar.

Para preparar exclusivamente la sesión del día 3:

```bash
npm run clase:dia3
npm run dev
```

## Alternativa: WSL y VS Code

Con Node **22.12 o superior de la rama 22**, abre la carpeta desde WSL en VS Code y ejecuta:

```bash
npm ci
npm run cliente
npm run dev
```

Abre `http://localhost:5173` en tu navegador de Windows. Puedes guardar el proyecto en tu carpeta personal de Linux para trabajar desde WSL.

Si prefieres utilizar el mismo contenedor de Codespaces localmente, necesitas Docker Desktop con integración WSL y la extensión Dev Containers de VS Code. Abre la carpeta y selecciona **Dev Containers: Reopen in Container**. Esta opción también instala las dependencias automáticamente.

**La Solana CLI no es requisito para ejecutar este frontend.** El programa puede compilarse y desplegarse desde Solana Playground; la app necesita su Program ID y su IDL.

## Conectar el programa de la clase

Obtén el IDL del programa que efectivamente desplegaste en Devnet, colócalo temporalmente en una carpeta local e impórtalo:

```bash
npm run configurar:idl -- /ruta/al/registro.json
```

Si el archivo no incluye dirección:

```bash
npm run configurar:idl -- /ruta/al/registro.json --program-id TU_PROGRAM_ID
```

El comando comprueba nombres, orden y tipos de argumentos y campos de cuentas; conserva un respaldo del IDL anterior, reemplaza `idl.json`, genera el cliente y actualiza la configuración. Reinicia `npm run dev` después de la importación. No cambies direcciones a mano dentro del código generado.

Si eres instructor, puedes hacer esta configuración una sola vez y publicar el repositorio ya conectado al programa de la clase. Los participantes pueden usar el mismo programa desplegado y crear registros separados con sus propias wallets. El día 3 pueden volver a generar el cliente a partir del mismo IDL.

Sigue la explicación completa en [IDL y Playground](docs/IDL-Y-PLAYGROUND.md).

## Comandos de clase

| Comando | Resultado |
| --- | --- |
| `npm run clase:dia3` | Abre Conexión y reserva Registro para el día 4. |
| `npm run clase:dia4` | Abre Registro y deja dos funciones como ejercicios: crear cliente y registrar venta. |
| `npm run clase:resuelto` | Restaura las cinco operaciones resueltas. |
| `npm run cliente` | Regenera el cliente desde el IDL actual. |
| `npm run comprobar:idl` | Comprueba coherencia entre IDL, configuración y dirección generada. |
| `npm run verificar` | Comprueba TypeScript, ejecuta pruebas y genera el build. |

Los cambios de modo reemplazan **`src/solana/acciones.ts`**. Antes de sobrescribirlo guardan una copia en `.aula/respaldos/`. Conservan el IDL, el cliente generado y su Program ID. Haz un commit de tu trabajo antes de cambiar de modo; si quieres conservar un ejercicio resuelto a mano, no vuelvas a aplicar el modo hasta guardarlo.

## Mapa del proyecto

| Ruta | Qué contiene |
| --- | --- |
| `src/config/interfaz.ts` | Título, nombre inicial del negocio y etiqueta del importe. |
| `src/components/Conexion.tsx` | Pantalla de wallet y saldos. |
| `src/components/Registro.tsx` | Formularios, lectura de datos y estados de las operaciones. |
| `src/solana/conexion.ts` | Un mismo endpoint para las lecturas y los envíos. |
| `src/solana/pdas.ts` y `seeds.ts` | Derivación de Registro, Cliente y Venta. |
| `src/solana/lecturas.ts` | Lecturas y adaptación de cuentas para la interfaz. |
| `src/solana/acciones.ts` | Integración que estudiamos y completamos en clase. |
| `src/solana/tx.ts` | Conversión de instrucciones, envío, confirmación y errores. |
| `clients/js/src/generated/` | Cliente generado con Codama; no se edita manualmente. |
| `idl.json` | Contrato del programa utilizado para generar el cliente. |
| `programa/` | Copia de referencia del programa Rust y su cliente de Playground. |
| `materiales/` | Versiones resuelta y de ejercicio de `acciones.ts`. |
| `docs/` | Guías de clase, pruebas y alcance técnico. |

Codama genera instrucciones y decodificadores con Solana Kit. Wallet Adapter utiliza `@solana/web3.js` para enviar la transacción a la wallet. El puente entre ambos ya está preparado en `tx.ts`; no se plantea reconstruirlo durante una clase de 60–90 minutos.

## Configurar otro RPC de Devnet

El endpoint predeterminado es `https://api.devnet.solana.com`. Si hay límites de uso, copia `.env.example` a `.env.local` y configura `VITE_SOLANA_RPC_URL` con otro endpoint **de Devnet**. Reinicia Vite.

Las variables `VITE_*` quedan expuestas al navegador: no pongas claves privadas ni secretos de servidor. Antes de solicitar una firma, la app comprueba que el RPC corresponde a Devnet y que el programa indicado está desplegado como cuenta ejecutable.

## Pruebas y alcance

```bash
npm run verificar
```

Las pruebas automatizadas verifican semillas, serialización y roles de cuentas, confirmaciones exitosas y fallidas simuladas, interrupciones de confirmación, red Devnet, validaciones y contrato del IDL. **No envían transacciones a la cadena.**

Consulta [Pruebas manuales](docs/PRUEBAS-MANUALES.md), [Seguridad y alcance](docs/SEGURIDAD-Y-ALCANCE.md) y [Estado de validación](docs/ESTADO-DE-VALIDACION.md). Es un proyecto educativo para Devnet, con límites conocidos del programa base.

## Material de las sesiones

- [Día 3: conexión, RPC y cliente generado](docs/DIA-3.md).
- [Día 4: operaciones del registro](docs/DIA-4.md).
- [Punto de partida del día 5](docs/DIA-5-PUNTO-DE-PARTIDA.md).
- [Origen de los materiales y cambios realizados](docs/ORIGENES.md).
