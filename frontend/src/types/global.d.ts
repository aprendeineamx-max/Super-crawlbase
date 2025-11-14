// Tipos globales para el proyecto
// Estos tipos ayudan a TypeScript mientras se instalan las dependencias

type AnyIntrinsicElement = Record<string, Record<string, unknown>>;

declare global {
  namespace JSX {
    interface IntrinsicElements extends AnyIntrinsicElement {
      /** Campo fantasma para mantener compatibilidad con las reglas de lint */
      readonly _fallback?: never;
    }
  }
}

export {};

