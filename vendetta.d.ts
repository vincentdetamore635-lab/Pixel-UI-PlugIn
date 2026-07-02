// Type stubs for @vendetta/* runtime imports provided by Revenge
// These are injected by the mod at runtime, not bundled

declare module "@vendetta/patcher" {
  export function after(
    method: string,
    obj: any,
    fn: (args: any[], result: any) => any
  ): () => void;

  export function before(
    method: string,
    obj: any,
    fn: (args: any[]) => any
  ): () => void;

  export function instead(
    method: string,
    obj: any,
    fn: (args: any[], original: (...args: any[]) => any) => any
  ): () => void;
}

declare module "@vendetta/metro" {
  export function findByProps(...props: string[]): any;
  export function findByDisplayName(name: string, defaultExp?: boolean): any;
}

declare module "@vendetta/metro/common" {
  export const stylesheet: any;
  export const React: any;
  export const ReactNative: any;
}

declare module "@vendetta/ui/assets" {
  export function getAssetIDByName(name: string): number;
}

declare module "@vendetta/ui" {
  export const General: any;
}

declare module "@vendetta/storage" {
  export function useProxy<T>(storage: T): T;
  export function createStorage<T>(path: string): T;
}

declare module "@vendetta/plugin" {
  export const storage: Record<string,
    any>;
}
