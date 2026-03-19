declare module "d3-force-3d" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function forceCollide(radius?: number | ((node: any) => number)): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function forceCenter(x?: number, y?: number): any;
}
