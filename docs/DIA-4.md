# Día 4 · Operaciones y validación del registro

## Preparación

El IDL real y el programa de Devnet deben estar configurados. Comprueba previamente las cinco operaciones con la versión resuelta y una wallet de práctica.

```bash
npm run clase:dia4
npm run dev
```

El modo de ejercicio deja `crearRegistro`, `cambiarMonto` y `hacerDevolucion` implementados. Las funciones `crearCliente` y `registrarVenta` muestran un error explícito hasta completarlas. Todo el proyecto compila aunque estén pendientes.

## Ruta sugerida para 75–90 minutos

| Tiempo orientativo | Qué hacemos |
| --- | --- |
| 0–10 min | Abrir el mismo template del día 3; consultar un registro y seguir Registro → Cliente → Venta. |
| 10–25 min | Recorrer `crearRegistro`: validar, obtener autoridad, derivar PDA, crear instrucción, enviar y confirmar. |
| 25–45 min | Completar `crearCliente`: leer siguiente ID, derivar Cliente y construir la instrucción. |
| 45–65 min | Completar `registrarVenta`: reutilizar la cadena de cuentas y pasar los argumentos de la venta. |
| 65–80 min | Demostrar corrección y devolución ya preparadas. Comprobar un éxito y un rechazo. |
| 80–90 min | Revisar errores, evidencia y límites antes de hablar de producción. |

En 60 minutos, completa crear cliente con el grupo y usa registrar venta como ejemplo explicado con la solución. No intentes construir los cinco formularios o explicar todo el puente de librerías durante la sesión.

## Ejercicio 1: crear cliente

Abre `src/solana/acciones.ts`. Usa `crearRegistro` como patrón y el tipo del constructor generado como guía.

1. Validar `nombreNegocio` y `nombre`.
2. Obtener la identidad con `firmante(wallet)`.
3. Derivar Registro con `pdaRegistro`.
4. Consultar `siguienteId(nombreNegocio, owner.address)`.
5. Derivar Cliente con `pdaCliente(registro, id)`.
6. Crear la instrucción con `getCrearClienteInstruction({ owner, registro, cliente, nombre })`.
7. Devolver `enviar(ix, wallet, connection, opciones)`.

El ID se utiliza para derivar la cuenta, **no se envía como argumento de `crear_cliente`**. El programa lo asigna desde su contador. Una creación concurrente puede invalidar el ID calculado: se vuelve a leer el estado antes de intentar de nuevo.

## Ejercicio 2: registrar venta

1. Validar negocio, ID, SKU, descripción y monto con las funciones ya preparadas.
2. Obtener `owner` mediante `firmante(wallet)`.
3. Obtener Registro, Cliente y Venta con `cadena(nombreNegocio, owner.address, idCliente, sku)`.
4. Construir `getRegistrarVentaInstruction` con esas cuentas y los cuatro argumentos de la venta.
5. Devolver `enviar` con las mismas opciones de estado de la interfaz.

La solución está en `materiales/acciones-resuelto.ts.txt`. Puedes contrastar funciones sin cambiar de modo. `npm run clase:resuelto` reemplaza el archivo entero; antes guarda tu avance.

## Qué explicar del envío

`createNoopSigner` representa una identidad para construir la instrucción: no genera una clave privada ni firma por el usuario. La firma real ocurre en la wallet.

El puente de `tx.ts` conserva bytes, orden de cuentas, firmas y permisos de escritura. Después se obtiene un blockhash, se construye la transacción y la wallet recibe la solicitud.

No basta con recibir una firma: se espera confirmación y se comprueba `value.err`. Si el RPC deja de responder después del envío, se conserva la firma y se pide revisar Explorer antes de repetir la operación. Si la transacción fue exitosa pero falla la lectura posterior, se comunica que la operación se confirmó y que solo falló la actualización de pantalla.

## Demostraciones de seguridad y evidencia

- Caso exitoso: alta de cliente o venta, dirección de cuenta, firma y lectura actualizada.
- Caso rechazado por el programa: repetir un SKU activo para el mismo cliente.
- Cancelar una firma: comprobar que la app no anuncia éxito.
- Mostrar `Signer`, `has_one` y semillas en Rust para explicar que la protección real está en el programa.
- Aclarar que los límites del formulario mejoran la experiencia pero se pueden eludir con otro cliente.

Consulta `PRUEBAS-MANUALES.md` y `SEGURIDAD-Y-ALCANCE.md` para completar la preparación sin agregar otra actividad al programa del bootcamp.
