/// <reference path="../../typings/bundle.d.ts" />
/// <reference path="../custom_typings/highland.d.ts" />

import * as highland from "highland";
import File = require("vinyl");
import {
  GulpStyledoccoIndividualDependingAPI,
  styledoccoIndividual,
} from "../index";
import * as assert from "assert";


describe("gulp-styledocco-individual", () => {
  it("should pass through no files", () => {
    const [execStyledoccoStub] = createExecStyledoccoStub();

    const stream = highland<File>([])
      .pipe(styledoccoIndividual(null, { execStyledocco: execStyledoccoStub }));

    return waitUntilStreamEnd(stream)
      .then((vinylFiles) => {
        assert.deepEqual([], vinylFiles);
      });
  });


  it("should pass through several files", () => {
    const vinylFiles = [
      createFile("path/to/css/1"),
      createFile("path/to/css/2"),
      createFile("path/to/css/3"),
    ];
    const [execStyledoccoStub] = createExecStyledoccoStub();

    const stream = highland<File>(vinylFiles)
      .pipe(styledoccoIndividual(null, { execStyledocco: execStyledoccoStub }));

    return waitUntilStreamEnd(stream)
      .then((caughtVinylFiles) => {
        assert.deepEqual(vinylFiles, caughtVinylFiles);
      });
  });


  it("should never call execStyledocco when no files", () => {
    const [execStyledoccoStub, callArgsList] = createExecStyledoccoStub();

    const stream = highland<File>([])
      .pipe(styledoccoIndividual(null, { execStyledocco: execStyledoccoStub }));

    return waitUntilStreamEnd(stream)
      .then((vinylFiles) => {
        assert.strictEqual(0, callArgsList.length);
      });
  });


  it("should call execStyledocco 3 times when given 3 files", () => {
    const vinylFiles = [
      createFile("path/to/css/1"),
      createFile("path/to/css/2"),
      createFile("path/to/css/3"),
    ];
    const [execStyledoccoStub, callArgsList] = createExecStyledoccoStub();

    const stream = highland<File>(vinylFiles)
      .pipe(styledoccoIndividual(null, { execStyledocco: execStyledoccoStub }));

    return waitUntilStreamEnd(stream)
      .then(() => {
        assert.strictEqual(3, callArgsList.length);
      });
  });
});


function createFile(path: string) {
  return new File({
    cwd: "/",
    base: "/",
    path: path,
    contents: new Buffer(""),
  });
}


function waitUntilStreamEnd<R>(stream: Highland.Stream<R>): Promise<R[]> {
  return new Promise<R[]>(function(onFulfilled, onRejected) {
    highland(stream)
    .stopOnError(function(error) {
      onRejected(error);
    })
    .toArray(function(files) {
      onFulfilled(files);
    });
  });
}


function createExecStyledoccoStub(): [GulpStyledoccoIndividualDependingAPI.execStyledocco, CallArgs[]] {
  const callArgsList: CallArgs[] = [];

  const execStyledoccoStub: GulpStyledoccoIndividualDependingAPI.execStyledocco = function() {
    const callArgs = Array.prototype.slice.call(arguments);
    callArgsList.push(callArgs);
    return Promise.resolve();
  };

  return [execStyledoccoStub, callArgsList];
}


type CallArgs = any[];
