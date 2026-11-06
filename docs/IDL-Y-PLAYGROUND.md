# IDL, Playground y cliente generado

## Qué archivo necesitamos

El IDL describe las instrucciones, sus argumentos y las estructuras de cuentas de un programa Anchor. Codama lo utiliza para generar el cliente TypeScript. El Program ID identifica el programa; no sustituye la descripción de sus datos.

Exporta el IDL del mismo código que se compiló y desplegó en Devnet. El proyecto admite el formato legacy de Anchor y el formato moderno con `address`, discriminadores y definiciones en `types`, siempre que describan el modelo del bootcamp.

El IDL incluido procede del material de referencia de David y utiliza la dirección `38oTMyvUTmqkBQeMiuok5F2mPjp9dVadWdBeQTDNmTUY`. Sirve para generar y estudiar el cliente. No se presupone que sea tu despliegue ni que esté disponible: el proyecto bloquea sus operaciones del registro.

## Contrato que espera la app

| Instrucción Rust | Argumentos, en orden |
| --- | --- |
| `crear_registro` | nombre del negocio: `String` |
| `crear_cliente` | nombre: `String` |
| `registrar_venta` | ID: `u16`, SKU: `String`, descripción: `String`, monto: `u32` |
| `cambiar_monto` | ID: `u16`, SKU: `String`, nuevo monto: `u32` |
| `hacer_devolucion` | ID: `u16`, SKU: `String` |

Las cuentas son Registro (autoridad, nombre, direcciones de clientes y contador), Cliente (ID, nombre, compras y direcciones de ventas) y Venta (SKU, descripción y monto). El comando de importación comprueba nombres, orden y tipos de argumentos y campos. La compatibilidad con el despliegue real se verifica después con transacciones: esta validación no reemplaza esa prueba.

Rust puede exportar `_id_cliente` como nombre de argumento. El generador utiliza una copia temporal que elimina el guion bajo inicial para que el cliente mantenga `idCliente`. No modifica el orden, el tipo ni los bytes que se serializan. El `idl.json` original se conserva como fuente de referencia.

## Importación

```bash
npm run configurar:idl -- ./tmp-idl/registro.json
```

Si no contiene dirección:

```bash
npm run configurar:idl -- ./tmp-idl/registro.json --program-id TU_PROGRAM_ID
```

La importación expresa que utilizaremos ese despliegue, incluso si su dirección coincide con la de referencia de David. Esta selección se conserva al regenerar el cliente mientras no cambie el IDL. Antes de publicar, comprueba las operaciones con ese despliegue real.

Se respalda el IDL anterior en `.aula/respaldos/`. Si la generación falla después de importar, el comando lo comunica: corrige el problema o restaura el IDL del respaldo y ejecuta `npm run cliente` antes de continuar.

Después de cambiar el IDL, reinicia el servidor de desarrollo. Si modificas el archivo manualmente, ejecuta `npm run cliente`: las comprobaciones previas a `dev` y `build` detectan un cliente desactualizado respecto al IDL.

## Qué se genera y qué se edita

- **Se edita:** código propio en `src/solana/`, componentes y configuración de interfaz.
- **Se importa:** `idl.json` del despliegue.
- **Se genera:** `clients/js/src/generated/` y `src/config/programa.json`.

El script ajusta también el `package.json` del cliente para consumirlo como TypeScript y módulos ESM en este proyecto. Mantén versionados el IDL, la configuración y el cliente generado juntos.

## Wallet de Playground y wallet del navegador

No tienen por qué ser la misma. Para leer un registro basta su dirección pública de autoridad y el nombre exacto del negocio. Para modificarlo debe firmar su autoridad.

Para clase es más sencillo crear un negocio nuevo con la wallet del navegador. Compartir un Program ID entre participantes no comparte la autoridad de sus registros: esta forma parte de la derivación de la PDA.

## Problemas frecuentes

| Síntoma | Qué revisar |
| --- | --- |
| Sigue el aviso de referencia | Debes importar el IDL del programa que usaremos, no cambiar solo la apariencia del aviso. |
| El programa no está desplegado | Program ID y RPC de Devnet; compilar no equivale a desplegar. |
| No aparece el negocio | Nombre exacto y autoridad; cambiar mayúsculas o espacios cambia la derivación. |
| Fallan las semillas | ID del cliente como `u16` little-endian, negocio, autoridad y SKU. |
| No permite otro SKU de más de 5 bytes | Límite previsto por el espacio del ejemplo; longitud en bytes UTF-8. |
| No aparece la wallet | Abrir la app en el navegador con extensión compatible, fuera de la vista incrustada. |
| RPC responde 429 | Esperar o utilizar un endpoint de Devnet propio configurado en `.env.local`. |

Referencias: [IDL en Solana](https://solana.com/docs/programs/idls) y [Codama](https://github.com/codama-idl/codama).
