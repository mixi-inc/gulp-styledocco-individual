function flatMap(array, fn) {
    return Array.prototype.concat.apply([], array.map(fn));
}
exports.flatMap = flatMap;
function uniqueStrings(array) {
    var dict = {};
    array.forEach(function (str) {
        dict[str] = true;
    });
    return Object.keys(dict);
}
exports.uniqueStrings = uniqueStrings;
