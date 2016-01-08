/// <reference path="../../typings/bundle.d.ts" />
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

declare module "child-process-promise" {
  type Options = {
    cwd: string;
  };
  export function execFile(bin: string, args?: string[], options?: Options): Promise<{ stdout: Buffer, stderr: Buffer }>;
}
