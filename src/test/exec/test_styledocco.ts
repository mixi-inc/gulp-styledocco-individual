/// <reference path="../../../typings/bundle.d.ts" />

import * as Path from "path";
import * as assert from "assert";
import {
  buildArgs,
  execStyledocco,
  StyledoccoDependingAPI,
} from "../../exec/styledocco";

// Root path of the package.
const BASE_PATH = Path.resolve(__dirname, "..", "..", "..");


describe("gulp-styledocco-individual", () => {
  describe("execStyledocco", () => {
    it("should call child-process-promise's execFile with a default bin path and" +
       "the passed file", () => {
      const [execFileStub, callArgsList] = createExecFileStub({ stdout: new Buffer(0), stderr: new Buffer(0) });
      const di = { execFile: execFileStub };

      const fileAbsPaths = [
        Path.resolve(BASE_PATH, "test/fixture/CSS"),
      ];
      const basePath = BASE_PATH;
      const options = {};

      return execStyledocco(fileAbsPaths, basePath, options, di)
        .then(() => {
          const [bin, args] = callArgsList[0];
          assert(bin.match(/\/node_modules\/styledocco\/bin\/styledocco$/));
          assert.deepEqual(args, [ "test/fixture/CSS" ]);
        });
    });


    it("should call child-process-promise's execFile with a default bin path and " +
       "the several passed files", () => {
      const [execFileStub, callArgsList] = createExecFileStub({ stdout: new Buffer(0), stderr: new Buffer(0) });
      const di = { execFile: execFileStub };

      const fileAbsPaths = [
        Path.resolve(BASE_PATH, "test/fixture/CSS_1"),
        Path.resolve(BASE_PATH, "test/fixture/CSS_2"),
        Path.resolve(BASE_PATH, "test/fixture/CSS_3"),
      ];
      const basePath = BASE_PATH;
      const options = {};

      return execStyledocco(fileAbsPaths, basePath, options, di)
        .then(() => {
          const [bin, args] = callArgsList[0];
          assert(bin.match(/\/node_modules\/styledocco\/bin\/styledocco$/));
          assert.deepEqual(args, [
            "test/fixture/CSS_1",
            "test/fixture/CSS_2",
            "test/fixture/CSS_3",
          ]);
        });
    });


    it("should call child-process-promise's execFile with a specified " +
        "bin path (by options.styledocco) and the passed files", () => {

      const [execFileStub, callArgsList] = createExecFileStub({ stdout: new Buffer(0), stderr: new Buffer(0) });
      const di = { execFile: execFileStub };

      const fileAbsPaths = [
        Path.resolve(BASE_PATH, "test/fixture/CSS_1"),
        Path.resolve(BASE_PATH, "test/fixture/CSS_2"),
        Path.resolve(BASE_PATH, "test/fixture/CSS_3"),
      ];
      const basePath = BASE_PATH;
      const options = {
        styledocco: Path.resolve("test/fixture/MY_STYLEDOCCO"),
      };

      return execStyledocco(fileAbsPaths, basePath, options, di)
        .then(() => {
          const [bin, args] = callArgsList[0];
          assert(bin.match(/\/test\/fixture\/MY_STYLEDOCCO$/));
          assert.deepEqual(args, [
            "test/fixture/CSS_1",
            "test/fixture/CSS_2",
            "test/fixture/CSS_3",
          ]);
        });
    });


    it("should call child-process-promise's execFile with a default bin path and " +
       "several options the passed files", () => {

      const [execFileStub, callArgsList] = createExecFileStub({ stdout: new Buffer(0), stderr: new Buffer(0) });
      const di = { execFile: execFileStub };

      const fileAbsPaths = [
        Path.resolve(BASE_PATH, "test/fixture/CSS_1"),
        Path.resolve(BASE_PATH, "test/fixture/CSS_2"),
        Path.resolve(BASE_PATH, "test/fixture/CSS_3"),
      ];
      const basePath = BASE_PATH;
      const options = {
        noMinify: true,
      };

      return execStyledocco(fileAbsPaths, basePath, options, di)
        .then(() => {
          const [bin, args] = callArgsList[0];
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


  describe("buildArgs", () => {
    it("should map options.out to --out", () => {
      const args = buildArgs({
        out: "test/fixtures/PROP_OUT",
      });

      assert.deepEqual(args, [
          "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
      ]);
    });


    it("should map options.name to --name", () => {
      const args = buildArgs({
        out: "test/fixtures/PROP_OUT",
        name: "PROP_NAME",
      });

      assert.deepEqual(args, [
        "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
        "--name", "PROP_NAME",
      ]);
    });


    it("should map options.preprocessor to --preprocessor", () => {
      const args = buildArgs({
        out: "test/fixtures/PROP_OUT",
        preprocessor: "test/fixtures/PROP_PREPROCESSOR",
      });

      assert.deepEqual(args, [
        "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
        "--preprocessor", Path.resolve(BASE_PATH, "test/fixtures/PROP_PREPROCESSOR"),
      ]);
    });


    it("should ignore empty options.includes", () => {
      const args = buildArgs({
        out: "test/fixtures/PROP_OUT",
        includes: [],
      });

      assert.deepEqual(args, [
        "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
      ]);
    });


    it("should map options.includes to --include", () => {
      const args = buildArgs({
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


    it("should map options.includes to several --include", () => {
      const args = buildArgs({
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


    it("should map truthy options.verbose to --verbose", () => {
      const args = buildArgs({
        out: "test/fixtures/PROP_OUT",
        verbose: true,
      });

      assert.deepEqual(args, [
        "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
        "--verbose",
      ]);
    });


    it("should ignore falsey options.verbose", () => {
      const args = buildArgs({
        out: "test/fixtures/PROP_OUT",
        verbose: false,
      });

      assert.deepEqual(args, [
        "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
      ]);
    });


    it("should map truthy options.noMinify to --no-minify", () => {
      const args = buildArgs({
        out: "test/fixtures/PROP_OUT",
        noMinify: true,
      });

      assert.deepEqual(args, [
        "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
        "--no-minify",
      ]);
    });


    it("should ignore falsey options.noMinify", () => {
      const args = buildArgs({
        out: "test/fixtures/PROP_OUT",
        noMinify: false,
      });

      assert.deepEqual(args, [
        "--out", Path.resolve(BASE_PATH, "test/fixtures/PROP_OUT"),
      ]);
    });


    it("should map to compound options", () => {
      const args = buildArgs({
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


function createExecFileStub(resultStub: { stdout?: Buffer; stderr?: Buffer }): [StyledoccoDependingAPI.execFile, CallArgs[]] {
  const stdout = resultStub.stdout || new Buffer(0);
  const stderr = resultStub.stderr || new Buffer(0);

  const callArgsList: CallArgs[] = [];

  const execFileStub: StyledoccoDependingAPI.execFile = (fileName, args) => {
    callArgsList.push([fileName, args]);
    return Promise.resolve({ stdout, stderr });
  };

  return [execFileStub, callArgsList];
}


type CallArgs = any[];
