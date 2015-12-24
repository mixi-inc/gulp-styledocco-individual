/// <reference path="../typings/bundle.d.ts" />
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
/// <reference path="./custom_typings/highland.d.ts" />
var highland = require("highland");
var styledocco_individual_1 = require("./exec/styledocco_individual");
;
/**
 * A duplex stream for building documents individually.
 * @param options Options.
 * @param di Dependency Injection for testing.
 * @return Stream can be piped to gulp streams.
 *   This stream pass through vinyl files that is given.
 */
function styledoccoIndividual(options, di) {
    var throughStream = highland.pipeline(function (srcStream) {
        var srcStreamWrapped = highland(srcStream);
        return srcStreamWrapped.fork()
            .collect()
            .flatMap(function (vinylFiles) {
            if (vinylFiles.length < 1) {
                return highland([]);
            }
            var vinylFilesNotEmpty = vinylFiles;
            // All path that we can give to StyleDocco should be absoulte.
            // StyleDocco is affected whether an input file path is relative or not.
            // For example, StyleDocco puts a generated doc to ${options.out}/path/to/file.html
            // when path/to/file.css specieifed.
            // So, we should control the relative path by modifying cwd for controling
            // the output directory location.
            var basePath = styledocco_individual_1.getCommonBasePath(vinylFilesNotEmpty);
            var fileAbsPaths = vinylFilesNotEmpty.map(function (vinylFile) { return vinylFile.path; });
            var waitingComplete = styledocco_individual_1.execStyledoccoIndividual(fileAbsPaths, basePath, options, di);
            return highland(waitingComplete);
        })
            .pipe(waitAndSwitchTo(srcStreamWrapped.fork()));
    });
    return simulateGulpDest(throughStream);
}
exports.styledoccoIndividual = styledoccoIndividual;
/**
 * Returns a file path to the doc.
 * @param filePath File path to document.
 * @param basePath Base path of the filePath. Typically, it should be vinyl.base.
 * @param options Options for gulp-styledocco-individual.
 * @return File path to the doc. This function is useful for incremental building.
 */
function getOutputPath(filePath, basePath, options) {
    return styledocco_individual_1.guessDocumentPath(filePath, basePath, options);
}
exports.getOutputPath = getOutputPath;
function simulateGulpDest(srcStream) {
    // Exhaust stream contents
    setImmediate(function () { return srcStream.resume(); });
    // When execStyledocco is done, it means all docs were generated.
    // So, we should simulate gulp.dest behavior.
    srcStream.on("end", function () { srcStream.emit("finish"); });
    return srcStream;
}
function waitAndSwitchTo(through) {
    return highland.pipeline(function (streamToWait) {
        // XXX: Wait the stream "streamToWait" and pass through
        //      the given stream "through".
        var emptyStreamToWait = streamToWait.reject(function () { return true; });
        return highland([emptyStreamToWait, through]).merge();
    });
}
