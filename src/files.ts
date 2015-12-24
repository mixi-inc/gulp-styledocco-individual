/// <reference path="../typings/bundle.d.ts" />

// XXX: For load only typings. The following import syntax do not work
//      because vinyl.d.ts exports a class not interface.
//
//        import * as File "Vinyl"
//
import File = require("vinyl");
export type VinylFile = File;
