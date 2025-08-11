// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_NAME: string;
  readonly VITE_API_KEY: string;
  readonly VITE_REGION: string;
}
declare global {
  interface Window {
    Razorpay: any;
  }
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
declare namespace JSX {
  interface IntrinsicElements {
    'box-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      name?: string;
      type?: string;
      color?: string;
    };
  }
}
