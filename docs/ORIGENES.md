# Origen de los materiales

Base revisada el 6 de noviembre de 2026.

| Material | Referencia utilizada |
| --- | --- |
| Propuesta inicial del día 3 | [DvdRivas/test](https://github.com/DvdRivas/test), commit `6e41bbabfc7764fcf786f92b73ea784b5fc3cc38` |
| Propuesta funcional del día 4 y base del frontend | [DvdRivas/test2](https://github.com/DvdRivas/test2), commit `be374ebd6e810d1595a9f0d794df84c622bc5459` |
| Programa y cliente de Playground | [WayLearnLatam/Registro-Ventas-Solana-PDA](https://github.com/WayLearnLatam/Registro-Ventas-Solana-PDA), commit `1a414a889446934723d0c998a0a1977e79087dcb` |

El IDL de referencia procede de la propuesta de David. No es un IDL exportado durante esta preparación a partir de un nuevo despliegue propio.

Se conserva la arquitectura Solana Kit + Codama y Wallet Adapter de la propuesta. Se añadieron una interfaz común entre sesiones, tipos en las acciones, validaciones, confirmación con revisión de errores, comprobación de Devnet, importación de IDL, modos de clase con respaldos, pruebas y documentación.

`programa/src/lib.rs` y `programa/client/client.ts` son copias del repositorio del programa indicado; no se modificaron para esta entrega. La carpeta `programa/` sirve de referencia para Playground y no contiene un workspace Anchor CLI completo.

Los materiales originales son de David Rivas y WayLearn. Esta entrega no establece una licencia nueva para esos materiales.
