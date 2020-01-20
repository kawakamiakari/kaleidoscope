"use strict";
exports.__esModule = true;
var Kaleidoscope = /** @class */ (function () {
    function Kaleidoscope() {
        console.log('init');
    }
    Kaleidoscope.prototype.greet = function () {
        console.log('hello');
    };
    return Kaleidoscope;
}());
exports["default"] = Kaleidoscope;
(function () {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Kaleidoscope;
    }
    else {
        window.Kaleidoscope = Kaleidoscope;
    }
})();
