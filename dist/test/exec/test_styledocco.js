/// <reference path="../../../typings/bundle.d.ts" />
var Path = require("path");
var assert = require("assert");
var styledocco_1 = require("../../exec/styledocco");
// Root path of the package.
var BASE_PATH = Path.resolve(__dirname, "..", "..", "..");
describe("gulp-styledocco-individual", function () {
    describe("execStyledocco", function () {
        it("should call child-process-promise's execFile with a default bin path and" +
            "the passed file", function () {
            var _a = createExecFileStub({ stdout: new Buffer(0), stderr: new Buffer(0) }), execFileStub = _a[0], callArgsList = _a[1];
            var di = { execFile: execFileStub };
            var fileAbsPaths = [
                Path.resolve(BASE_PATH, "test/fixture/CSS"),
            ];
            var basePath = BASE_PATH;
            var options = {};
            return styledocco_1.execStyledocco(fileAbsPaths, basePath, options, di)
                .then(function () {
                var _a = callArgsList[0], bin = _a[0], args = _a[1];
                assert(bin.match(/\/node_modules\/styledocco\/bin\/styledocco$/));
                assert.deepEqual(args, ["test/fixture/CSS"]);
            });
        });
        it("should call child-process-promise's execFile with a default bin path and " +
            "the several passed files", function () {
            var _a = createExecFileStub({ stdout: new Buffer(0), stderr: new Buffer(0) }), execFileStub = _a[0], callArgsList = _a[1];
            var di = { execFile: execFileStub };
            var fileAbsPaths = [
                Path.resolve(BASE_PATH, "test/fixture/CSS_1"),
                Path.resolve(BASE_PATH, "test/fixture/CSS_2"),
                Path.resolve(BASE_PATH, "test/fixture/CSS_3"),
            ];
            var basePath = BASE_PATH;
            var options = {};
            return styledocco_1.execStyledocco(fileAbsPaths, basePath, options, di)
                .then(function () {
                var _a = callArgsList[0], bin = _a[0], args = _a[1];
                assert(bin.match(/\/node_modules\/styledocco\/bin\/styledocco$/));
                assert.deepEqual(args, [
                    "test/fixture/CSS_1",
                    "test/fixture/CSS_2",
                    "test/fixture/CSS_3",
                ]);
            });
        });
        it("should call child-process-promise's execFile with a specified " +
            "bin path (by options.styledocco) and the passed files", function () {
            var _a = createExecFileStub({ stdout: new Buffer(0), stderr: new Buffer(0) }), execFileStub = _a[0], callArgsList = _a[1];
            var di = { execFile: execFileStub };
            var fileAbsPaths = [
                Path.resolve(BASE_PATH, "test/fixture/CSS_1"),
                Path.resolve(BASE_PATH, "test/fixture/CSS_2"),
                Path.resolve(BASE_PATH, "test/fixture/CSS_3"),
            ];
            var basePath = BASE_PATH;
            var options = {
                styledocco: Path.resolve("test/fixture/MY_STYLEDOCCO"),
            };
            return styledocco_1.execStyledocco(fileAbsPaths, basePath, options, di)
                .then(function () {
                var _a = callArgsList[0], bin = _a[0], args = _a[1];
                assert(bin.match(/\/test\/fixture\/MY_STYLEDOCCO$/));
                assert.deepEqual(args, [
                    "test/fixture/CSS_1",
                    "test/fixture/CSS_2",
                    "test/fixture/CSS_3",
                ]);
            });
        });
        it("should call child-process-promise's execFile with a default bin path and " +
            "several options the passed files", function () {
            var _a = createExecFileStub({ stdout: new Buffer(0), stderr: new Buffer(0) }), execFileStub = _a[0], callArgsList = _a[1];
            var di = { execFile: execFileStub };
            var fileAbsPaths = [
                Path.resolve(BASE_PATH, "test/fixture/CSS_1"),
                Path.resolve(BASE_PATH, "test/fixture/CSS_2"),
                Path.resolve(BASE_PATH, "test/fixture/CSS_3"),
            ];
            var basePath = BASE_PATH;
            var options = {
                noMinify: true,
            };
            return styledocco_1.execStyledocco(fileAbsPaths, basePath, options, di)
                .then(function () {
                var _a = callArgsList[0], bin = _a[0], args = _a[1];
                assert("string", typeof bin);
                assert.deepEqual(args, [
                    "test/fixture/CSS_1",
                    "test/fixture/CSS_2",
                    "test/fixture/CSS_3",
                    "--no-minify",
                ]);
            });
        });
    });
    describe("buildArgs", function () {
        it("should map options.out to --out", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
            ]);
        });
        it("should map options.name to --name", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                name: "PROP_NAME",
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
                "--name", "PROP_NAME",
            ]);
        });
        it("should map options.preprocessor to --preprocessor", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                preprocessor: "test/fixtures/PROP_PREPROCESSOR",
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
                "--preprocessor", Path.resolve(BASE_PATH, "test/fixtures/PROP_PREPROCESSOR"),
            ]);
        });
        it("should ignore empty options.includes", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                includes: [],
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
            ]);
        });
        it("should map options.includes to --include", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                includes: [
                    "test/fixtures/PROP_INCLUDE_1",
                ],
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
                "--include", Path.resolve(BASE_PATH, "test/fixtures/PROP_INCLUDE_1"),
            ]);
        });
        it("should map options.includes to several --include", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                includes: [
                    "test/fixtures/PROP_INCLUDE_1",
                    "test/fixtures/PROP_INCLUDE_2",
                    "test/fixtures/PROP_INCLUDE_3",
                ],
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
                "--include", Path.resolve(BASE_PATH, "test/fixtures/PROP_INCLUDE_1"),
                "--include", Path.resolve(BASE_PATH, "test/fixtures/PROP_INCLUDE_2"),
                "--include", Path.resolve(BASE_PATH, "test/fixtures/PROP_INCLUDE_3"),
            ]);
        });
        it("should map truthy options.verbose to --verbose", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                verbose: true,
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
                "--verbose",
            ]);
        });
        it("should ignore falsey options.verbose", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                verbose: false,
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
            ]);
        });
        it("should map truthy options.noMinify to --no-minify", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                noMinify: true,
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
                "--no-minify",
            ]);
        });
        it("should ignore falsey options.noMinify", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                noMinify: false,
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
            ]);
        });
        it("should map to compound options", function () {
            var args = styledocco_1.buildArgs({
                out: "test/fixtures/PROP_OUT",
                name: "PROP_NAME",
                preprocessor: "PROP_PREPROCESSOR",
                includes: [
                    "test/fixtures/PROP_INCLUDE_1",
                    "test/fixtures/PROP_INCLUDE_2",
                    "test/fixtures/PROP_INCLUDE_3",
                ],
                verbose: true,
                noMinify: true,
            });
            assert.deepEqual(args, [
                "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
                "--name", "PROP_NAME",
                "--preprocessor", Path.resolve(BASE_PATH, "PROP_PREPROCESSOR"),
                "--include", Path.resolve(BASE_PATH, "test/fixtures/PROP_INCLUDE_1"),
                "--include", Path.resolve(BASE_PATH, "test/fixtures/PROP_INCLUDE_2"),
                "--include", Path.resolve(BASE_PATH, "test/fixtures/PROP_INCLUDE_3"),
                "--verbose",
                "--no-minify",
            ]);
        });
    });
});
function createExecFileStub(resultStub) {
    var stdout = resultStub.stdout || new Buffer(0);
    var stderr = resultStub.stderr || new Buffer(0);
    var callArgsList = [];
    var execFileStub = function (fileName, args) {
        callArgsList.push([fileName, args]);
        return Promise.resolve({ stdout: stdout, stderr: stderr });
    };
    return [execFileStub, callArgsList];
}
