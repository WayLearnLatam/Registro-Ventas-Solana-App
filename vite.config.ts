import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // host: true -> necesario para que Codespaces pueda exponer el puerto
  server: { host: true, port: 5173, strictPort: true },

  /*
  El cliente que genera Codama consulta process.env para decidir si incluye los
  mensajes de error. process es de Node y no existe en el navegador: sin esta
  linea la pagina se queda en blanco con "process is not defined" en cuanto
  importas algo del cliente generado.
  */
  define: { "process.env": "{}" },
});
