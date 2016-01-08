/// <reference path="../../typings/bundle.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var arrays_1 = require("../arrays");
var styledocco_1 = require("./styledocco");
;
/**
 * Returns a common base path for given vinyl files.
 * @param vinylFilesNotEmpty Vinyl files that must be not empty.
 * @return Common base path.
 * @throws StyledoccoAmbiguousBasePathError
 */
function getCommonBasePath(vinylFilesNotEmpty) {
    var basePathCandidates = arrays_1.uniqueStrings(vinylFilesNotEmpty.map(function (vinylFile) { return vinylFile.base; }));
    if (basePathCandidates.length > 1) {
        throw StyledoccoAmbiguousBasePathError.createByAmbiguousBasePaths(basePathCandidates);
    }
    return basePathCandidates[0];
}
exports.getCommonBasePath = getCommonBasePath;
/**
 * An error class means that the common base path is ambiguous
 * because different base paths found.
 */
var StyledoccoAmbiguousBasePathError = (function (_super) {
    __extends(StyledoccoAmbiguousBasePathError, _super);
    function StyledoccoAmbiguousBasePathError(msg) {
        _super.call(this, msg);
        this.message = msg;
    }
    /**
     * Returns a StyledoccoAmbiguousBasePathError from ambiguous base paths.
     * @param ambiguousBasePaths Base paths that include different base paths.
     * @return An error.
     */
    StyledoccoAmbiguousBasePathError.createByAmbiguousBasePaths = function (ambiguousBasePaths) {
        return new StyledoccoAmbiguousBasePathError("Ambiguous base paths found: " + ambiguousBasePaths.join(", "));
    };
    return StyledoccoAmbiguousBasePathError;
})(Error);
exports.StyledoccoAmbiguousBasePathError = StyledoccoAmbiguousBasePathError;
/**
 * Guess an output document file path.
 * @param filePath File path to document.
 * @param basePath Base path of the filePath. Typically, it should be vinyl.base.
 * @param options Options may include options.out for specifing an output directory path.
 * @return File path to the doc. This function is useful for incremental building.
 */
function guessDocumentPath(filePath, basePath, options) {
    var outDirPath = guessOptionsOutProp(options);
    var individualOutDirPath = getIndividualOutputDirectoryPath(outDirPath, filePath, basePath);
    var individualOutDirPathObj = Path.parse(individualOutDirPath);
    var docPathObj = {
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
exports.guessDocumentPath = guessDocumentPath;
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
function execStyledoccoIndividual(fileAbsPaths, basePath, options, di) {
    var progress = {
        total: fileAbsPaths.length,
        remain: fileAbsPaths.length,
    };
    return execStyledoccoIndividualRecurse(fileAbsPaths, basePath, progress, options, di)
        .then(function () { return undefined; });
}
exports.execStyledoccoIndividual = execStyledoccoIndividual;
function execStyledoccoIndividualRecurse(fileAbsPaths, basePath, progress, options, di) {
    var fileAbsPath = fileAbsPaths[0], restFileAbsPaths = fileAbsPaths.slice(1);
    var optionsForIndividual = createStyledoccoOptionsByIndividualOptions(fileAbsPath, basePath, options);
    var execStyledoccoDi = getExecStyleDocco(di);
    var newProgress = {
        total: progress.total,
        remain: restFileAbsPaths.length,
    };
    if (optionsForIndividual.debug || optionsForIndividual.verbose) {
        console.log(formatProgress(newProgress));
    }
    return execStyledoccoDi([fileAbsPath], basePath, optionsForIndividual)
        .then(function () { return restFileAbsPaths.length === 0
        ? []
        : execStyledoccoIndividualRecurse(restFileAbsPaths, basePath, newProgress, options, di); });
}
function getExecStyleDocco(di) {
    return di && di.execStyledocco ? di.execStyledocco : styledocco_1.execStyledocco;
}
function createStyledoccoOptionsByIndividualOptions(fileAbsPath, basePath, options) {
    var originalOutDirPath = guessOptionsOutProp(options);
    var individualOutDirPath = getIndividualOutputDirectoryPath(originalOutDirPath, fileAbsPath, basePath);
    var optionsForIndividual = options ? cloneStyledoccoIndividualOptions(options) : {};
    optionsForIndividual.out = individualOutDirPath;
    return optionsForIndividual;
}
function cloneStyledoccoIndividualOptions(options) {
    var optionsForIndividual = {};
    Object.keys(options).forEach(function (key) {
        if (options.hasOwnProperty(key)) {
            optionsForIndividual[key] = options[key];
        }
    });
    return optionsForIndividual;
}
function guessOptionsOutProp(options) {
    // XXX: We need the output directory path, but this option is optional.
    //      So, we should use the StyleDocco's default options.out when it is not defined.
    return options && options.out ? options.out : "docs";
}
function getIndividualOutputDirectoryPath(outDirPath, filePath, basePath) {
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
    var relativePart = Path.relative(basePath, filePath);
    return Path.join(outDirPath, relativePart);
}
function formatProgress(progress) {
    return "Processing... (" + (progress.total - progress.remain) + "/" + progress.total + "):";
}
