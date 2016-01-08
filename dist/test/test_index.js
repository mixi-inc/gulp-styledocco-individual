/// <reference path="../../typings/bundle.d.ts" />
/// <reference path="../custom_typings/highland.d.ts" />
var highland = require("highland");
var File = require("vinyl");
var index_1 = require("../index");
var assert = require("assert");
describe("gulp-styledocco-individual", function () {
    it("should pass through no files", function () {
        var execStyledoccoStub = createExecStyledoccoStub()[0];
        var stream = highland([])
            .pipe(index_1.styledoccoIndividual(null, { execStyledocco: execStyledoccoStub }));
        return waitUntilStreamEnd(stream)
            .then(function (vinylFiles) {
            assert.deepEqual([], vinylFiles);
        });
    });
    it("should pass through several files", function () {
        var vinylFiles = [
            createFile("path/to/css/1"),
            createFile("path/to/css/2"),
            createFile("path/to/css/3"),
        ];
        var execStyledoccoStub = createExecStyledoccoStub()[0];
        var stream = highland(vinylFiles)
            .pipe(index_1.styledoccoIndividual(null, { execStyledocco: execStyledoccoStub }));
        return waitUntilStreamEnd(stream)
            .then(function (caughtVinylFiles) {
            assert.deepEqual(vinylFiles, caughtVinylFiles);
        });
    });
    it("should never call execStyledocco when no files", function () {
        var _a = createExecStyledoccoStub(), execStyledoccoStub = _a[0], callArgsList = _a[1];
        var stream = highland([])
            .pipe(index_1.styledoccoIndividual(null, { execStyledocco: execStyledoccoStub }));
        return waitUntilStreamEnd(stream)
            .then(function (vinylFiles) {
            assert.strictEqual(0, callArgsList.length);
        });
    });
    it("should call execStyledocco 3 times when given 3 files", function () {
        var vinylFiles = [
            createFile("path/to/css/1"),
            createFile("path/to/css/2"),
            createFile("path/to/css/3"),
        ];
        var _a = createExecStyledoccoStub(), execStyledoccoStub = _a[0], callArgsList = _a[1];
        var stream = highland(vinylFiles)
            .pipe(index_1.styledoccoIndividual(null, { execStyledocco: execStyledoccoStub }));
        return waitUntilStreamEnd(stream)
            .then(function () {
            assert.strictEqual(3, callArgsList.length);
        });
    });
});
function createFile(path) {
    return new File({
        cwd: "/",
        base: "/",
        path: path,
        contents: new Buffer(""),
    });
}
function waitUntilStreamEnd(stream) {
    return new Promise(function (onFulfilled, onRejected) {
        highland(stream)
            .stopOnError(function (error) {
            onRejected(error);
        })
            .toArray(function (files) {
            onFulfilled(files);
        });
    });
}
function createExecStyledoccoStub() {
    var callArgsList = [];
    var execStyledoccoStub = function () {
        var callArgs = Array.prototype.slice.call(arguments);
        callArgsList.push(callArgs);
        return Promise.resolve();
    };
    return [execStyledoccoStub, callArgsList];
}
