/// <reference path="../../typings/bundle.d.ts" />
/// <reference path="../custom_typings/highland.d.ts" />
/// <reference path="../custom_typings/child-process-promise.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var ChildProcessPromise = require("child-process-promise");
var arrays_1 = require("../arrays");
var DEFAULT_STYLEDOCCO_BIN_PATH = Path.resolve(__dirname, "../../node_modules/styledocco/bin/styledocco");
/**
 * An error class means that executing StyleDocco is failed.
 */
var StyledoccoExecutionError = (function (_super) {
    __extends(StyledoccoExecutionError, _super);
    function StyledoccoExecutionError(msg) {
        _super.call(this, msg);
        this.message = msg;
    }
    /**
     * Returns a StyledoccoExecutionError from an error like object.
     * @param errorLike Error like object may have a property "message".
     * @return An error.
     */
    StyledoccoExecutionError.createByErrorLikeObject = function (errorLike) {
        if (errorLike instanceof Error) {
            return new StyledoccoExecutionError("StyleDoccoExecutionError: " + errorLike.message);
        }
        return new StyledoccoExecutionError("StyleDoccoExecutionError: " + String(errorLike));
    };
    return StyledoccoExecutionError;
})(Error);
exports.StyledoccoExecutionError = StyledoccoExecutionError;
/**
 * Executes StyleDocco.
 * @param fileAbsPaths Absolute file paths to document.
 * @param basePath Base path of fileAbsPaths. The relative path from the base path
 *   to the fileAbsPath becomes the output directory path.
 * @param options StyleDocco options. See README.
 * @param di Dependency Injection for testing.
 * @return A promise that will be resolved when documentation is done.
 */
function execStyledocco(fileAbsPaths, basePath, options, di) {
    var binAbsPath = getStyleDoccoBinPath(options);
    // XXX: See FOOTNOTE_1.
    var fileRelPaths = fileAbsPaths.map(function (fileAbsPath) {
        return Path.relative(basePath, fileAbsPath);
    });
    // XXX: StyleDocco confuse a file path after a boolean flag such as --verbose.
    //      So, we should put file paths before the options to avoid the confusion.
    var args = fileRelPaths.concat(buildArgs(options));
    var verbose = Boolean(options.verbose);
    var debug = Boolean(options.debug);
    if (debug) {
        console.log("Executing: " + binAbsPath + " " + args.join(" "));
    }
    var execFile = getApiForExecFile(di);
    return execFile(binAbsPath, args, { cwd: basePath })
        .then(function (result) {
        if (debug || verbose) {
            console.log("" + result.stdout.toString("utf8"));
        }
        console.log("" + result.stderr.toString("utf8"));
    }, function (err) {
        throw StyledoccoExecutionError.createByErrorLikeObject(err);
        // avoid type error
        return undefined;
    });
}
exports.execStyledocco = execStyledocco;
/**
 * Returns arguments for the StyleDocco command.
 * This function is exported for testing.
 * @param options See README.md.
 */
function buildArgs(options) {
    var args = [];
    var cwd = process.cwd();
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
        var incAbsPath = options.includes.map(function (incRelPath) { return Path.resolve(cwd, incRelPath); });
        args.push.apply(args, arrays_1.flatMap(incAbsPath, function (include) { return ["--include", include]; }));
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
exports.buildArgs = buildArgs;
function getStyleDoccoBinPath(options) {
    return options.styledocco
        ? Path.resolve(process.cwd(), options.styledocco)
        : DEFAULT_STYLEDOCCO_BIN_PATH;
}
function getApiForExecFile(di) {
    return di && di.execFile
        ? di.execFile
        : ChildProcessPromise.execFile;
}
// FOOTNOTE_1: All file paths that we can give to StyleDocco should be absoulte path for avoiding confusion.
//             StyleDocco can be affected whether an input file path is relative or not.
//             For example, StyleDocco put a generated doc to ${options.out}/path-to-file.html
//             when path/to/file.css specieifed.
//             So, we should be able to control the file path for generated docs by modifying cwd.
