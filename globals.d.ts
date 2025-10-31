// Ce fichier fournit des définitions de types globales pour les bibliothèques chargées via des balises <script>.

declare global {
  interface Window {
    // Définit le type pour la bibliothèque jsPDF attachée à l'objet window
    jspdf: {
        jsPDF: new (options?: any) => any;
    };
    // Définit le type pour la bibliothèque html2canvas attachée à l'objet window
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}

// L'export vide est nécessaire pour que TypeScript traite ce fichier comme un module et applique les déclarations globales.
export {};
