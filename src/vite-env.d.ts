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

  namespace JSX {
    interface IntrinsicElements {
      'box-icon': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        name: string;
        type?: 'regular' | 'solid' | 'logo';
        color?: string;
        size?: 'xs' | 'sm' | 'md' | 'lg' | string;
        rotate?: '90' | '180' | '270' | string;
        flip?: 'horizontal' | 'vertical';
        border?: 'square' | 'circle';
        animation?: 'spin' | 'tada' | 'flashing' | 'burst' | 'float';
        pull?: 'left' | 'right';
        'data-id'?: string;
      };
    }
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}