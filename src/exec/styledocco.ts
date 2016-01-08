/// <reference path="../../typings/bundle.d.ts" />
/// <reference path="../custom_typings/highland.d.ts" />
/// <reference path="../custom_typings/child-process-promise.d.ts" />

import * as Path from "path";
import * as ChildProcessPromise from "child-process-promise";
import {flatMap} from "../arrays";


const DEFAULT_STYLEDOCCO_BIN_PATH = Path.resolve(__dirname,
  "../../node_modules/styledocco/bin/styledocco");


/**
 * Options.
 * @see README.md
 */
export type StyledoccoOptions = {
  out?: string;
  styledocco?: string;
  name?: string;
  preprocessor?: string;
  includes?: string[];
  verbose?: boolean;
  debug?: boolean;
  noMinify?: boolean;
};


/**
 * API can be replaced by stub for testing.
 */
export declare namespace StyledoccoDependingAPI {
  export type execFile = typeof ChildProcessPromise.execFile;
}


/**
 * A dictionary for DI.
 */
export interface StyledoccoDi {
  execFile?: StyledoccoDependingAPI.execFile;
}


/**
 * An error class means that executing StyleDocco is failed.
 */
export class StyledoccoExecutionError extends Error {
  constructor(msg: string) {
    super(msg);
    this.message = msg;
  }


  /**
   * Returns a StyledoccoExecutionError from an error like object.
   * @param errorLike Error like object may have a property "message".
   * @return An error.
   */
  static createByErrorLikeObject(errorLike: any): StyledoccoExecutionError {
    if (errorLike instanceof Error) {
      return new StyledoccoExecutionError(`StyleDoccoExecutionError: ${errorLike.message}`);
    }

    return new StyledoccoExecutionError(`StyleDoccoExecutionError: ${String(errorLike)}`);
  }
}


/**
 * Executes StyleDocco.
 * @param fileAbsPaths Absolute file paths to document.
 * @param basePath Base path of fileAbsPaths. The relative path from the base path
 *   to the fileAbsPath becomes the output directory path.
 * @param options StyleDocco options. See README.
 * @param di Dependency Injection for testing.
 * @return A promise that will be resolved when documentation is done.
 */
export function execStyledocco(fileAbsPaths: string[], basePath: string,
    options: StyledoccoOptions, di?: StyledoccoDi): Promise<void> {

  const binAbsPath = getStyleDoccoBinPath(options);

  // XXX: See FOOTNOTE_1.
  const fileRelPaths = fileAbsPaths.map((fileAbsPath) =>
    Path.relative(basePath, fileAbsPath));

  // XXX: StyleDocco confuse a file path after a boolean flag such as --verbose.
  //      So, we should put file paths before the options to avoid the confusion.
  const args = fileRelPaths.concat(buildArgs(options));
  const verbose = Boolean(options.verbose);
  const debug = Boolean(options.debug);

  if (debug) {
    console.log(`Executing: ${binAbsPath} ${args.join(" ")}`);
  }

  const execFile = getApiForExecFile(di);
  return execFile(binAbsPath, args, { cwd: basePath })
    .then((result) => {
      if (debug || verbose) {
        console.log(`${result.stdout.toString("utf8")}`);
      }
      console.log(`${result.stderr.toString("utf8")}`);
    }, (err) => {
      throw StyledoccoExecutionError.createByErrorLikeObject(err);

      // avoid type error
      return undefined;
    });
}


/**
 * Returns arguments for the StyleDocco command.
 * This function is exported for testing.
 * @param options See README.md.
 */
export function buildArgs(options: StyledoccoOptions): string[] {
  const args: string[] = [];
  const cwd = process.cwd();

  if (options.out) {
    // XXX: See FOOTNOTE_1.
    args.push("--out", Path.resolve(cwd, options.out));
  }

  if (options.name) {
    args.push("--name", options.name);
  }

  if (options.preprocessor) {
    // XXX: See FOOTNOTE_1.
    args.push("--preprocessor", Path.resolve(cwd, options.preprocessor));
  }

  if (options.includes) {
    // XXX: See FOOTNOTE_1.
    const incAbsPath = options.includes.map((incRelPath) => Path.resolve(cwd, incRelPath));
    args.push.apply(args, flatMap(incAbsPath, (include) => ["--include", include]));
  }

  // XXX: StyleDocco confuse a file path after a boolean flag such as --verbose.
  //      So, we should put file paths before the options to avoid the confusion.
  if (options.debug || options.verbose) {
    args.push("--verbose");
  }

  if (options.noMinify) {
    args.push("--no-minify");
  }

  return args;
}


function getStyleDoccoBinPath(options: StyledoccoOptions): string {
  return options.styledocco
    ? Path.resolve(process.cwd(), options.styledocco)
    : DEFAULT_STYLEDOCCO_BIN_PATH;
}


function getApiForExecFile(di?: StyledoccoDi): StyledoccoDependingAPI.execFile {
  return  di && di.execFile
    ? di.execFile
    : ChildProcessPromise.execFile;
}


// FOOTNOTE_1: All file paths that we can give to StyleDocco should be absoulte path for avoiding confusion.
//             StyleDocco can be affected whether an input file path is relative or not.
//             For example, StyleDocco put a generated doc to ${options.out}/path-to-file.html
//             when path/to/file.css specieifed.
//             So, we should be able to control the file path for generated docs by modifying cwd.
