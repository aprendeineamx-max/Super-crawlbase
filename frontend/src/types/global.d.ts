// Tipos globales para el proyecto
// Estos tipos ayudan a TypeScript mientras se instalan las dependencias

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};

