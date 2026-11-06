# Programa de referencia para Playground

Copia del programa `registro` de WayLearn, con Registro, Cliente y Venta. La procedencia y revisión están en `docs/ORIGENES.md`.

- `src/lib.rs`: programa de referencia sin modificar.
- `client/client.ts`: cliente de referencia para Solana Playground.

Esta carpeta no es un workspace Anchor CLI completo. El `declare_id!("")` de la fuente es el marcador del material de Playground; el proyecto de Playground debe gestionar la dirección real del programa antes de compilar y desplegar.

Para conectar el frontend, utiliza el IDL exportado del código que realmente desplegaste. Sigue `docs/IDL-Y-PLAYGROUND.md`. Si ya trabajas con el programa en el repositorio canónico o en Playground, no necesitas reemplazarlo por esta copia.
