# Estado de validación de la entrega

Revisión del 6 de noviembre de 2026. La entrega está en modo `resuelto` y conserva la configuración de referencia; no se presenta como conectada a un despliegue nuevo del instructor.

| Comprobación | Resultado |
| --- | --- |
| TypeScript y build de Vite | Correctos con Node 22.23.4; también comprobados con Node 24.22.1. |
| Pruebas automatizadas | 9 pruebas correctas; no envían transacciones. |
| Modos día 3, día 4 y resuelto | Los tres compilan; se conserva IDL, configuración del programa y cliente generado al cambiar de modo. |
| IDL legacy y moderno de Anchor | Generación y verificación correctas; el formato moderno se comprobó con una fixture de compatibilidad, no con un nuevo despliegue real. |
| IDL inválido | Se rechaza antes de reemplazar el archivo actual. |
| Importación explícita de un despliegue con la dirección de referencia | Conserva la selección al regenerar; configuración de referencia restaurada para esta entrega. |
| UI en navegador | Navegación, formularios, aviso de referencia, selección de wallet y error de dirección inválida comprobados. |
| Lectura real por RPC de Devnet | Comprobados genesis y consulta pública de saldo sin firma. |
| Firma y cinco operaciones con el programa del instructor | PENDIENTES: requieren importar su IDL y probar con su wallet de Devnet. |
| Lanzamiento real de GitHub Codespaces / Docker local | PENDIENTE: configuración incluida, sin crear un Codespace ni levantar Docker en esta preparación. |
| Instalación limpia del paquete | Correcta: ZIP extraído en una carpeta vacía, `npm ci`, generación del cliente y `npm run verificar`, con Node 22. |

Las confirmaciones exitosas, fallidas e interrumpidas de las pruebas automatizadas son respuestas simuladas para verificar el manejo de resultados. No equivalen a una transacción firmada con una wallet real.

El build informa de un bundle JavaScript de aproximadamente 712 kB antes de gzip, por las dependencias de Solana y wallet. Compila correctamente; la optimización de carga queda fuera del alcance de estas sesiones.

Los límites del programa se describen en `SEGURIDAD-Y-ALCANCE.md`. La copia Rust de referencia no se compiló con Anchor CLI durante esta preparación.
