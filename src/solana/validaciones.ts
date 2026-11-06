export function texto(valor: string, etiqueta: string, maxBytes: number): string {
  const limpio = valor.trim();
  if (!limpio) throw new Error(etiqueta + ' es obligatorio.');
  if (new TextEncoder().encode(limpio).length > maxBytes) {
    throw new Error(etiqueta + ' admite hasta ' + maxBytes + ' bytes UTF-8.');
  }
  return limpio;
}

export function entero(valor: number, etiqueta: string, maximo: number): number {
  if (!Number.isSafeInteger(valor) || valor < 1 || valor > maximo) {
    throw new Error(etiqueta + ' debe ser un entero entre 1 y ' + maximo + '.');
  }
  return valor;
}

export const negocioValido = (valor: string) => texto(valor, 'El nombre del negocio', 30);
export const nombreValido = (valor: string) => texto(valor, 'El nombre del cliente', 30);
export const skuValido = (valor: string) => texto(valor, 'El SKU', 5);
export const descripcionValida = (valor: string) => texto(valor, 'La descripción', 50);
export const idValido = (valor: number) => entero(valor, 'El identificador', 65_535);
export const montoValido = (valor: number) => entero(valor, 'El monto', 4_294_967_295);
