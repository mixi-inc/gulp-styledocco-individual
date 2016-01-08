/// <reference path="../../typings/bundle.d.ts" />

import * as Path from "path";
import {uniqueStrings} from "../arrays";
import {VinylFile} from "../files";
import {StyledoccoOptions, execStyledocco} from "./styledocco";


/**
 * API can be replaced by stub for testing.
 */
export declare namespace StyledoccoIndividualDependingAPI {
  export type execStyledocco = typeof execStyledocco;
};


/**
 * A dictionary for DI.
 */
export interface StyledoccoIndividualDi {
  execStyledocco?: StyledoccoIndividualDependingAPI.execStyledocco;
}


/**
 * Options.
 * @see README.md
 */
export type StyledoccoIndividualOptions = StyledoccoOptions;


/**
 * Returns a common base path for given vinyl files.
 * @param vinylFilesNotEmpty Vinyl files that must be not empty.
 * @return Common base path.
 * @throws StyledoccoAmbiguousBasePathError
 */
export function getCommonBasePath(vinylFilesNotEmpty: VinylFile[]): string {
  const basePathCandidates = uniqueStrings(vinylFilesNotEmpty.map((vinylFile) => vinylFile.base));

  if (basePathCandidates.length > 1) {
    throw StyledoccoAmbiguousBasePathError.createByAmbiguousBasePaths(basePathCandidates);
  }

  return basePathCandidates[0];
}


/**
 * An error class means that the common base path is ambiguous
 * because different base paths found.
 */
export class StyledoccoAmbiguousBasePathError extends Error {
  constructor(msg: string) {
    super(msg);
    this.message = msg;
  }


  /**
   * Returns a StyledoccoAmbiguousBasePathError from ambiguous base paths.
   * @param ambiguousBasePaths Base paths that include different base paths.
   * @return An error.
   */
  static createByAmbiguousBasePaths(ambiguousBasePaths: string[]): StyledoccoAmbiguousBasePathError {
    return new StyledoccoAmbiguousBasePathError(`Ambiguous base paths found: ${ambiguousBasePaths.join(", ")}`);
  }
}


/**
 * Guess an output document file path.
 * @param filePath File path to document.
 * @param basePath Base path of the filePath. Typically, it should be vinyl.base.
 * @param options Options may include options.out for specifing an output directory path.
 * @return File path to the doc. This function is useful for incremental building.
 */
export function guessDocumentPath(filePath: string, basePath: string, options?: StyledoccoIndividualOptions): string {
  const outDirPath = guessOptionsOutProp(options);
  const individualOutDirPath = getIndividualOutputDirectoryPath(outDirPath, filePath, basePath);
  const individualOutDirPathObj = Path.parse(individualOutDirPath);

  const docPathObj: Path.ParsedPath = {
    root: individualOutDirPathObj.root,
    dir: Path.join(individualOutDirPathObj.dir, individualOutDirPathObj.base),

    // XXX: I don't know why, StyleDocco removes "_" on heads of file names.
    //      https://github.com/jacobrask/styledocco/commit/9c86cd6eb578646733ecdef707623f43304e19c7
    base: individualOutDirPathObj.name.replace(/^_/, "") + ".html",
    name: individualOutDirPathObj.name,
    ext: ".html",
  };

  return Path.format(docPathObj);
}


/**
 * Executes StyleDocco individually.
 * This function can be executed incrementally.
 * @param fileAbsPaths Absolute file paths to document.
 * @param basePath Base path of fileAbsPaths. The relative path from the base path
 *   to the fileAbsPath becomes the output directory path.
 * @param options StyleDocco options. See README.
 * @param di Dependency Injection for testing.
 * @return A promise that will be resolved when documentation is done.
 */
export function execStyledoccoIndividual(fileAbsPaths: string[], basePath: string,
    options?: StyledoccoIndividualOptions, di?: StyledoccoIndividualDi): Promise<void> {

  const progress: Progress = {
    total: fileAbsPaths.length,
    remain: fileAbsPaths.length,
  };

  return execStyledoccoIndividualRecurse(fileAbsPaths, basePath, progress, options, di)
    .then(() => undefined);
}


function execStyledoccoIndividualRecurse(fileAbsPaths: string[], basePath: string, progress: Progress,
    options?: StyledoccoIndividualOptions, di?: StyledoccoIndividualDi): Promise<string[]> {

  const [fileAbsPath, ...restFileAbsPaths] = fileAbsPaths;
  const optionsForIndividual = createStyledoccoOptionsByIndividualOptions(fileAbsPath, basePath, options);

  const execStyledoccoDi = getExecStyleDocco(di);

  const newProgress: Progress = {
    total: progress.total,
    remain: restFileAbsPaths.length,
  };

  if (optionsForIndividual.debug || optionsForIndividual.verbose) {
    console.log(formatProgress(newProgress));
  }

  return execStyledoccoDi([fileAbsPath], basePath, optionsForIndividual)
    .then(() => restFileAbsPaths.length === 0
      ? []
      : execStyledoccoIndividualRecurse(restFileAbsPaths, basePath, newProgress, options, di));
}


function getExecStyleDocco(di?: StyledoccoIndividualDi): StyledoccoIndividualDependingAPI.execStyledocco {
  return di && di.execStyledocco ? di.execStyledocco : execStyledocco;
}


function createStyledoccoOptionsByIndividualOptions(fileAbsPath: string, basePath: string,
    options?: StyledoccoIndividualOptions): StyledoccoOptions {

  const originalOutDirPath = guessOptionsOutProp(options);
  const individualOutDirPath = getIndividualOutputDirectoryPath(originalOutDirPath, fileAbsPath, basePath);

  const optionsForIndividual = options ? cloneStyledoccoIndividualOptions(options) : <StyledoccoIndividualOptions> {};
  optionsForIndividual.out = individualOutDirPath;

  return optionsForIndividual;
}


function cloneStyledoccoIndividualOptions(options: StyledoccoIndividualOptions): StyledoccoIndividualOptions {
  const optionsForIndividual: any = {};

  Object.keys(<any> options).forEach((key) => {
    if (options.hasOwnProperty(key)) {
      optionsForIndividual[key] = (<any> options)[key];
    }
  });

  return optionsForIndividual;
}


function guessOptionsOutProp(options?: StyledoccoIndividualOptions): string {
  // XXX: We need the output directory path, but this option is optional.
  //      So, we should use the StyleDocco's default options.out when it is not defined.
  return options && options.out ? options.out : "docs";
}


function getIndividualOutputDirectoryPath(outDirPath: string, filePath: string, basePath: string): string {
  // XXX: We should avoid to generate docs to the same directory.
  //      We expect this module to be able to generate docs incrementaly.
  //      So this module generates docs for each CSS files.
  //
  //      But this approach has a problem that is a race condition of index.html.
  //      StyleDocco generates index.html on the same directory for each CSS file.
  //      So, we should use unique output directories among CSS files in this approach.
  //
  //      The unique output directory is like /path/to/out/something.css/something.html.
  //
  //      For example, when we give the condition:
  //
  //        options.out: /path/to/out
  //        basePath:    /path/to/css
  //        CSS A:       /path/to/css/a.css
  //        CSS B:       /path/to/css/sub-dir/b.css
  //
  //      then, we get the doc files:
  //
  //        Doc for CSS A:  /path/to/out/a.css/a.html
  //        Doc for CSS B:  /path/to/out/sub-dir/b.css/b.html
  const relativePart = Path.relative(basePath, filePath);
  return Path.join(outDirPath, relativePart);
}


interface Progress {
  total: number;
  remain: number;
}


function formatProgress(progress: Progress): string {
  return `Processing... (${progress.total - progress.remain}/${progress.total}):`;
}
