# Pruebas manuales antes de clase

Se realizan en Devnet, con el IDL real y una wallet de práctica. Estas pruebas siguen pendientes hasta conectar ese despliegue; no quedan acreditadas por ejecutar las pruebas unitarias.

## Preparación

- Importar IDL; ejecutar `npm run clase:resuelto` y `npm run verificar`.
- Abrir la app en el navegador con la wallet instalada.
- Confirmar el RPC de Devnet y disponer de SOL de prueba.
- Elegir un nombre nuevo de negocio, de hasta 30 bytes UTF-8.

## Recorrido funcional

| Caso | Resultado esperado |
| --- | --- |
| Consultar saldo sin conectar wallet | Lectura pública; ninguna firma. |
| Pegar una dirección inválida | Error comprensible; la página sigue operativa. |
| Crear registro | Confirmación y lectura del registro de esa autoridad. |
| Crear Ana | Cliente ID 1; dirección presente en Registro. |
| Vender CAF01 por 50 | Venta presente, compras activas 1 y cuenta Venta decodificable. |
| Corregir importe a 55 | Mismo SKU y PDA, monto actualizado. |
| Repetir CAF01 antes de devolverlo | Rechazo del programa; no se informa éxito ni se duplica el historial. |
| Cancelar una solicitud en la wallet | Aviso de cancelación; no se anuncia operación confirmada. |
| Hacer devolución | Se cierra Venta, desaparece del historial y compras disminuye. |
| Registrar CAF01 después de devolverlo | Puede crearse otra vez porque la cuenta anterior se cerró. |
| Consultar otra autoridad desde la app | Lectura permitida; formularios de escritura deshabilitados. |

El bloqueo visual de otra autoridad no demuestra por sí mismo el control onchain. Para documentarlo, utiliza también el cliente de Playground de los días 1–2 y una cuenta/autoridad que no corresponda; comprueba que las restricciones del programa rechacen el intento.

## Estados de error que hay que explicar

- Un fallo de preflight puede detectarse antes de que una transacción llegue a procesarse. No siempre habrá una transacción fallida visible en Explorer.
- Una firma enviada no equivale a ejecución exitosa; el resultado de confirmación incluye `err`.
- Si se pierde la confirmación, consulta la firma antes de repetir la operación.
- Un fallo de lectura después de confirmar no revierte una operación ya ejecutada.

## Evidencia para la sesión y el milestone

Guarda código/revisión utilizados, Program ID, direcciones públicas de las cuentas, firmas cuando existan, resultado esperado y resultado observado. Para rechazos de preflight pueden servir los logs y la explicación de la restricción que los causó.

No incluyas claves privadas, frases de recuperación ni datos personales reales de clientes.
