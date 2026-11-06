# Seguridad y alcance del proyecto educativo

## Controles del programa base

El código Rust utiliza `Signer` para exigir firma, `has_one = owner` para comprobar la autoridad y semillas para enlazar Registro, Cliente y Venta. La instrucción de devolución comprueba que la venta esté en el historial antes de retirarla y cerrar la cuenta.

Estos controles se explican con el código de los días 1–2 y se observan en la integración del día 4. Conectar una wallet o habilitar un botón no sustituye las restricciones del programa.

## Controles del frontend

- Validación de direcciones, texto en bytes UTF-8 e importes enteros positivos.
- Comprobación de coherencia entre IDL, Program ID y cliente generado.
- Comprobación del genesis de Devnet y de la cuenta ejecutable antes de solicitar la firma.
- Bloqueo de la configuración de referencia y de formularios correspondientes a otra autoridad.
- Distinción entre firma cancelada, error de ejecución, confirmación no comprobada y fallo de lectura posterior.
- No se guardan claves privadas ni se solicita una frase de recuperación.

Son medidas de esta aplicación. Un cliente diferente puede omitir sus validaciones: los controles de negocio que deban proteger la aplicación necesitan existir también en el programa.

## Límites que debemos reconocer en clase

El programa Rust se incluye sin modificar respecto a la referencia del bootcamp. `#[max_len]` se utiliza para calcular el espacio reservado: no es una validación explícita de longitud o capacidad de negocio.

El diseño reserva espacio para hasta 10 referencias de clientes en Registro y 10 de ventas activas en Cliente. La app evita crear más clientes en el flujo normal y valida tamaños de texto, pero el programa no ofrece todavía errores de negocio claros para todos los límites ni valida todos los valores positivos. Algunas entradas que evita el formulario pueden fallar por serialización o ser aceptadas desde otro cliente.

Otros puntos: capacidad fija, contador de cliente calculado a partir del estado (puede haber concurrencia), importe sin moneda ni decimales, sin pagos reales, sin privacidad de datos onchain y sin indexador. `compras` indica ventas activas, no el total histórico de compras; la devolución cierra la cuenta de la venta.

## Qué revisar antes de producción

Añadir y probar en el programa las reglas de negocio y sus errores; revisar límites y aritmética; evaluar crecimiento de cuentas y concurrencia; definir unidades de dinero y privacidad; probar permisos, casos fallidos y consistencia de estado; revisar autoridades de actualización, dependencias y operación del RPC; realizar una revisión de seguridad adecuada al uso.

Este paquete es una base didáctica de Devnet. Un build correcto o una demo funcional no acreditan por sí solos que el sistema esté listo para producción. Esta revisión se comenta dentro de las sesiones existentes.
