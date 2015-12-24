/// <reference path="../typings/bundle.d.ts" />
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
/// <reference path="./custom_typings/highland.d.ts" />

import * as highland from "highland";
import {VinylFile} from "./files";
import {
  StyledoccoIndividualOptions,
  StyledoccoIndividualDi,
  StyledoccoIndividualDependingAPI,
  getCommonBasePath,
  guessDocumentPath,
  execStyledoccoIndividual,
} from "./exec/styledocco_individual";


/**
 * Options.
 * @see README.md
 */
export type GulpStyledoccoIndividualOptions = StyledoccoIndividualOptions;


/**
 * API can be replaced by stub for testing.
 */
export declare namespace GulpStyledoccoIndividualDependingAPI {
  export type execStyledocco = StyledoccoIndividualDependingAPI.execStyledocco;
};


/**
 * Dependency Injection for testing.
 */
export type GulpStyledoccoIndividualDi = StyledoccoIndividualDi;


/**
 * A duplex stream for building documents individually.
 * @param options Options.
 * @param di Dependency Injection for testing.
 * @return Stream can be piped to gulp streams.
 *   This stream pass through vinyl files that is given.
 */
export function styledoccoIndividual(options?: GulpStyledoccoIndividualOptions,
    di?: GulpStyledoccoIndividualDi): Highland.Stream<VinylFile> {
  const throughStream = highland.pipeline<VinylFile, VinylFile>((srcStream) => {
    const srcStreamWrapped = highland<VinylFile>(srcStream);

    return srcStreamWrapped.fork()
      .collect()
      .flatMap((vinylFiles) => {
        if (vinylFiles.length < 1) {
          return highland<void>([]);
        }

        const vinylFilesNotEmpty = vinylFiles;

        // All path that we can give to StyleDocco should be absoulte.
        // StyleDocco is affected whether an input file path is relative or not.
        // For example, StyleDocco puts a generated doc to ${options.out}/path/to/file.html
        // when path/to/file.css specieifed.
        // So, we should control the relative path by modifying cwd for controling
        // the output directory location.
        const basePath = getCommonBasePath(vinylFilesNotEmpty);
        const fileAbsPaths = vinylFilesNotEmpty.map((vinylFile) => vinylFile.path);

        const waitingComplete = execStyledoccoIndividual(fileAbsPaths, basePath, options, di);

        return highland<void>(waitingComplete);
      })
      .pipe(waitAndSwitchTo<VinylFile, VinylFile>(srcStreamWrapped.fork()));
  });

  return simulateGulpDest(throughStream);
}


/**
 * Returns a file path to the doc.
 * @param filePath File path to document.
 * @param basePath Base path of the filePath. Typically, it should be vinyl.base.
 * @param options Options for gulp-styledocco-individual.
 * @return File path to the doc. This function is useful for incremental building.
 */
export function getOutputPath(filePath: string, basePath: string, options?: StyledoccoIndividualOptions): string {
  return guessDocumentPath(filePath, basePath, options);
}


function simulateGulpDest(srcStream: Highland.Stream<VinylFile>): Highland.Stream<VinylFile> {
  // Exhaust stream contents
  setImmediate(() => srcStream.resume());

  // When execStyledocco is done, it means all docs were generated.
  // So, we should simulate gulp.dest behavior.
  srcStream.on("end", () => { srcStream.emit("finish"); });

  return srcStream;
}


function waitAndSwitchTo<T, S>(through: Highland.Stream<T>): Highland.Stream<T> {
  return highland.pipeline<S, T>((streamToWait) => {
    // XXX: Wait the stream "streamToWait" and pass through
    //      the given stream "through".
    const emptyStreamToWait = streamToWait.reject(() => true);
    return highland([<any> emptyStreamToWait, through]).merge();
  });
}
