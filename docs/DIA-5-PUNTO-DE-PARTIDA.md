# Día 5 · Punto de partida para vibe coding

David puede partir del proyecto en modo `clase:resuelto`, conectado al IDL real y con las operaciones probadas en Devnet. El objetivo es seguir una modificación a través de programa, IDL, cliente e interfaz y comprobar sus resultados.

Una posible extensión es eliminar un cliente solo cuando no tenga ventas activas. **No está implementada en este paquete.** Antes de incorporarla hay que definir sus restricciones, añadir y probar la instrucción en Rust y exportar un IDL nuevo. El validador admite instrucciones adicionales, manteniendo las cinco existentes y las estructuras de cuenta esperadas.

Flujo de trabajo: definir cambio y resultado esperado → generar propuesta con IA → revisar permisos y estado → compilar y probar → exportar IDL → regenerar cliente → integrar en frontend → comprobar éxito y rechazo.

Si el cambio altera argumentos o campos de las cuentas actuales, habrá que actualizar también la validación del contrato y el código propio que depende de ellos. El cliente generado se regenera, no se corrige manualmente.

No incluimos un prompt definitivo ni una implementación adelantada: se alinean con David a partir de la base ya validada y el alcance acordado de la sesión.
