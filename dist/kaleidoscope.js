"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var Kaleidoscope = (function () {
    // Merges the keys of two objects.
    function extend(source, obj) {
        Object.keys(obj).forEach(function (key) {
            source[key] = obj[key];
        });
        return source;
    }
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    // Rotate the point around the center point.
    function rotate(x, y, centerX, centerY, rad) {
        var X = Math.cos(rad) * (x - centerX) - Math.sin(rad) * (y - centerY) + centerX;
        var Y = Math.sin(rad) * (x - centerX) + Math.cos(rad) * (y - centerY) + centerY;
        return { x: X, y: Y };
    }
    var Pipe = /** @class */ (function () {
        function Pipe(context, options) {
            this.directionX = 0;
            this.directionY = 0;
            this.options = null;
            this.context = null;
            this.radianAOB = 0;
            this.pointO = { x: 0, y: 0 };
            this.pointA = { x: 0, y: 0 };
            this.pointB = { x: 0, y: 0 };
            this.isSharp = null;
            this.inclinationOA = 0;
            this.interceptOA = 0;
            this.inclinationOB = 0;
            this.interceptOB = 0;
            this.inclinationAB = 0;
            this.interceptAB = 0;
            this.context = context;
            this.options = options;
            this.radianAOB = (2 * Math.PI) / options.edge;
            this.calculateBorder();
            this.initializeEvents();
        }
        // Get the center point of the kaleidoscope.
        Pipe.prototype.getPointO = function () {
            return this.pointO;
        };
        // Get the random point in the pipe.
        Pipe.prototype.getRandomCoordinates = function () {
            var x = getRandomInt(Math.max(this.pointO.x, this.pointB.x) - this.pointA.x) +
                this.pointA.x;
            var minY;
            var maxY;
            var y;
            if (this.isSharp) {
                minY = Math.max(this.inclinationOB * x + this.interceptOB, this.inclinationAB * x + this.interceptAB);
                maxY = this.inclinationOA * x + this.interceptOA;
            }
            else {
                minY = this.inclinationAB * x + this.interceptAB;
                maxY = Math.min(this.inclinationOA * x + this.interceptOA, this.inclinationOB * x + this.interceptOB);
            }
            y = getRandomInt(maxY - minY) + minY;
            return { x: x, y: y };
        };
        // Return whether the particle is in the pipe.
        Pipe.prototype.isIn = function (particle) {
            var retval = true;
            var x = particle.x;
            var y = particle.y;
            var size = particle.size * 2; // Oversized
            if (this.isSharp) {
                var minY = Math.max(this.inclinationOB * x + this.interceptOB, this.inclinationAB * x + this.interceptAB);
                var maxY = this.inclinationOA * x + this.interceptOA;
                if (y - size > maxY || y + size < minY) {
                    retval = false;
                }
            }
            else {
                var minY = this.inclinationAB * x + this.interceptAB;
                var maxY = Math.min(this.inclinationOA * x + this.interceptOA, this.inclinationOB * x + this.interceptOB);
                if (y - size > maxY || y + size < minY) {
                    retval = false;
                }
            }
            return retval;
        };
        // Draw on a mirror surface.
        Pipe.prototype.mirror = function (index, drawFunc) {
            var context = this.context;
            context.save();
            context.translate(this.pointO.x, this.pointO.y);
            context.rotate(this.radianAOB * index);
            context.translate(-this.pointO.x, -this.pointO.y);
            context.beginPath();
            context.moveTo(this.pointO.x, this.pointO.y);
            context.lineTo(this.pointA.x, this.pointA.y);
            context.lineTo(this.pointB.x, this.pointB.y);
            context.closePath();
            context.clip();
            drawFunc();
            context.restore();
        };
        // destroy the object.
        Pipe.prototype.destroy = function () {
            window.removeEventListener('mousemove', this.listenerMousemove);
        };
        // Kick off various things on window resize.
        Pipe.prototype.resize = function () {
            this.calculateBorder();
        };
        // Register event listeners.
        Pipe.prototype.initializeEvents = function () {
            var _this = this;
            this.listenerMousemove = function (event) {
                var unit = Math.sqrt(Math.pow((event.clientX - _this.pointO.x), 2) +
                    Math.pow((event.clientY - _this.pointO.y), 2));
                if (unit === 0)
                    return;
                _this.directionX = (event.clientX - _this.pointO.x) / unit;
                _this.directionY = (event.clientY - _this.pointO.y) / unit;
                var element = document.querySelector(_this.options.selector);
                element.dispatchEvent(new Event('change:direction'));
            };
            window.addEventListener('mousemove', this.listenerMousemove);
        };
        // Calculate the formula for the border.
        Pipe.prototype.calculateBorder = function () {
            var canvas = document.querySelector(this.options.selector);
            this.pointO.x = canvas.offsetParent
                ? canvas.offsetParent.clientWidth / 2
                : canvas.clientWidth / 2;
            if (canvas.offsetParent && canvas.offsetParent.nodeName === 'BODY') {
                this.pointO.y = window.innerHeight / 2;
            }
            else {
                this.pointO.y = canvas.offsetParent
                    ? canvas.offsetParent.clientHeight / 2
                    : canvas.clientHeight / 2;
            }
            var diagonal = Math.sqrt(Math.pow(this.pointO.x, 2) + Math.pow(this.pointO.y, 2));
            var radius = diagonal / Math.cos(this.radianAOB / 2);
            this.pointA = {
                x: (1 - radius / diagonal) * this.pointO.x,
                y: (1 - radius / diagonal) * this.pointO.y
            };
            this.pointB = rotate(this.pointA.x, this.pointA.y, this.pointO.x, this.pointO.y, this.radianAOB);
            var pointO = this.pointO;
            var pointA = this.pointA;
            var pointB = this.pointB;
            this.isSharp = pointB.x < this.pointO.x;
            this.inclinationOA = (pointA.y - pointO.y) / (pointA.x - pointO.x);
            this.interceptOA = pointO.y - this.inclinationOA * pointO.x;
            this.inclinationOB = (pointB.y - pointO.y) / (pointB.x - pointO.x);
            this.interceptOB = pointO.y - this.inclinationOB * pointO.x;
            this.inclinationAB = (pointB.y - pointA.y) / (pointB.x - pointA.x);
            this.interceptAB = pointA.y - this.inclinationAB * pointA.x;
        };
        return Pipe;
    }());
    var Particle = /** @class */ (function () {
        function Particle(context, options, pipe) {
            this.size = 0;
            this.x = 0;
            this.y = 0;
            this.options = null;
            this.context = null;
            this.pipe = null;
            this.shape = null;
            this.color = null;
            this.opacity = 0;
            this.v = 0;
            this.radian = (2 * Math.PI) / (getRandomInt(6) + 1);
            this.directionX = 0;
            this.directionY = 0;
            this.context = context;
            this.options = options;
            this.pipe = pipe;
            this.shape = options.shapes[getRandomInt(options.shapes.length)];
            this.size =
                getRandomInt(options.maxSize - options.minSize) + options.minSize;
            this.color = options.color[getRandomInt(options.color.length)];
            var p = pipe.getRandomCoordinates();
            this.x = p.x;
            this.y = p.y;
            this.v = (Math.random() + 0.5) * options.speed;
            this.directionX = pipe.directionX;
            this.directionY = pipe.directionY;
            this.initializeEvents();
        }
        // The particles draw function.
        Particle.prototype.draw = function () {
            var context = this.context;
            switch (this.shape) {
                case 'circle':
                    context.save();
                    // Settings
                    context.fillStyle = this.color;
                    context.globalAlpha = this.opacity;
                    // Draw
                    context.beginPath();
                    context.arc(this.x, this.y, this.size / 2, 0, 2 * Math.PI, false);
                    context.closePath();
                    context.fill();
                    context.restore();
                    break;
                case 'drop':
                    context.save();
                    // Settings
                    context.fillStyle = this.color;
                    context.globalAlpha = this.opacity;
                    // Rotate
                    context.translate(this.x + this.size / 3, this.y + this.size / 2);
                    context.rotate(this.radian);
                    context.translate(-(this.size / 3), -(this.size / 2));
                    // Draw
                    context.beginPath();
                    context.moveTo(0, this.size * (2 / 3));
                    context.quadraticCurveTo(0, this.size / 3, this.size / 3, 0);
                    context.quadraticCurveTo(this.size * (2 / 3), this.size * (1 / 3), this.size * (2 / 3), this.size * (2 / 3));
                    context.arc(this.size * (1 / 3), this.size * (2 / 3), this.size * (1 / 3), 0, Math.PI, false);
                    context.closePath();
                    context.fill();
                    context.restore();
                    break;
                case 'heart':
                    context.save();
                    // Settings
                    context.fillStyle = this.color;
                    context.globalAlpha = this.opacity;
                    // Rotate
                    context.translate(this.x + this.size / 2, this.y + this.size / 2);
                    context.rotate(this.radian);
                    context.translate(-(this.size / 2), -(this.size / 2));
                    // Draw
                    context.beginPath();
                    context.moveTo(this.size * (75 / 130), this.size * (40 / 140));
                    context.bezierCurveTo(this.size * (75 / 130), this.size * (37 / 140), this.size * (70 / 130), this.size * (25 / 140), this.size * (50 / 130), this.size * (25 / 140));
                    context.bezierCurveTo(this.size * (20 / 130), this.size * (25 / 140), this.size * (20 / 130), this.size * (62.5 / 140), this.size * (20 / 130), this.size * (62.5 / 140));
                    context.bezierCurveTo(this.size * (20 / 130), this.size * (80 / 140), this.size * (40 / 130), this.size * (102 / 140), this.size * (75 / 130), this.size * (120 / 140));
                    context.bezierCurveTo(this.size * (110 / 130), this.size * (102 / 140), this.size, this.size * (80 / 140), this.size, this.size * (62.5 / 140));
                    context.bezierCurveTo(this.size, this.size * (62.5 / 140), this.size, this.size * (25 / 140), this.size * (100 / 130), this.size * (25 / 140));
                    context.bezierCurveTo(this.size * (85 / 130), this.size * (25 / 140), this.size * (75 / 130), this.size * (37 / 140), this.size * (75 / 130), this.size * (40 / 140));
                    context.fill();
                    context.restore();
                    break;
                case 'oval':
                    context.save();
                    // Settings
                    context.fillStyle = this.color;
                    context.globalAlpha = this.opacity;
                    // Rotate
                    context.translate(this.x + this.size / 2, this.y + this.size / 2);
                    context.rotate(this.radian);
                    context.scale(1, 3 / 4);
                    context.translate(-(this.size / 2), -(this.size / 2));
                    // Draw
                    context.beginPath();
                    context.arc(0, 0, this.size / 2, 0, 2 * Math.PI, false);
                    context.closePath();
                    context.fill();
                    context.restore();
                    break;
                case 'square':
                    context.save();
                    // Settings
                    context.fillStyle = this.color;
                    context.globalAlpha = this.opacity;
                    // Rotate
                    context.translate(this.x + this.size / 2, this.y + this.size / 2);
                    context.rotate(this.radian);
                    context.translate(-(this.size / 2), -(this.size / 2));
                    // Draw
                    context.beginPath();
                    context.rect(0, 0, this.size, this.size);
                    context.closePath();
                    context.fill();
                    context.restore();
                    break;
                case 'star':
                    context.save();
                    // Settings
                    context.fillStyle = this.color;
                    context.globalAlpha = this.opacity;
                    // Rotate
                    context.translate(this.x + this.size / 2, this.y + this.size * (9 / 10));
                    context.rotate(this.radian);
                    context.translate(-(this.size / 2), -(this.size * (9 / 10)));
                    // Draw
                    context.beginPath();
                    context.moveTo(0, this.size * (70 / 200));
                    context.lineTo(this.size, this.size * (70 / 200));
                    context.lineTo(this.size * (35 / 200), this.size * (180 / 200));
                    context.lineTo(this.size * (100 / 200), 0);
                    context.lineTo(this.size * (165 / 200), this.size * (180 / 200));
                    context.closePath();
                    context.fill();
                    context.restore();
                    break;
                case 'triangle':
                    context.save();
                    // Settings
                    context.fillStyle = this.color;
                    context.globalAlpha = this.opacity;
                    // Rotate
                    context.translate(this.x + this.size / 2, this.y + (1 - Math.tan(Math.PI / 6) / 2) * this.size);
                    context.rotate(this.radian);
                    context.translate(-(this.size / 2), -((1 - Math.tan(Math.PI / 6) / 2) * this.size));
                    // Draw
                    context.beginPath();
                    context.moveTo(0, this.size);
                    context.lineTo(this.size / 2, (1 - Math.tan(Math.PI / 3) / 2) * this.size);
                    context.lineTo(this.size, this.size);
                    context.closePath();
                    context.fill();
                    context.restore();
                    break;
                case 'wave':
                    context.save();
                    // Settings
                    context.strokeStyle = this.color;
                    context.globalAlpha = this.opacity;
                    context.lineWidth = this.size * 0.3;
                    context.lineJoin = 'round';
                    context.lineCap = 'round';
                    // Rotate
                    context.translate(this.x + this.size * 0.5, this.y + this.size * 0.2);
                    context.rotate(this.radian);
                    context.translate(-(this.size * 0.5), -(this.size * 0.2));
                    // Draw
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(this.size * 0.2, this.size * 0.4);
                    context.lineTo(this.size * 0.4, 0);
                    context.lineTo(this.size * 0.6, this.size * 0.4);
                    context.lineTo(this.size * 0.8, 0);
                    context.lineTo(this.size, this.size * 0.4);
                    context.stroke();
                    context.restore();
                    break;
                default:
                    break;
            }
        };
        // This updates the particles coordinates.
        Particle.prototype.updateCoordinates = function () {
            if (this.opacity < 1) {
                this.opacity += 0.1;
            }
            if (this.directionX && this.directionY) {
                this.x += this.v * this.directionX;
                this.y += this.v * this.directionY;
            }
            else {
                this.y += this.v;
            }
            this.radian += this.v * 0.002 * Math.PI;
        };
        Particle.prototype.isInPipe = function () {
            return this.pipe.isIn(this);
        };
        // Register event listeners.
        Particle.prototype.initializeEvents = function () {
            var _this = this;
            var element = document.querySelector(this.options.selector);
            element.addEventListener('change:direction', function () {
                _this.directionX = _this.pipe.directionX;
                _this.directionY = _this.pipe.directionY;
            });
        };
        return Particle;
    }());
    var Plugin = /** @class */ (function () {
        // Initialize the plugin with user settings.
        function Plugin(settings) {
            this.options = null;
            this.defaults = {
                color: ['#FFD1B9', '#564138', '#2E86AB', '#F5F749', '#F24236'],
                edge: 10,
                globalCompositeOperation: 'overlay',
                maxSize: 50,
                minSize: 30,
                quantity: 50,
                selector: null,
                shapes: ['square', 'circle', 'wave'],
                speed: 0.3
            };
            this.element = null;
            this.context = null;
            this.animationID = null;
            this.pipe = null;
            this.storage = [];
            this.options = extend(__assign({}, this.defaults), settings);
            this.initializeCanvas();
            this.initializeEvents();
            this.initializePipe();
            this.initializeStorage();
            this.animate();
        }
        // destroy the plugin.
        Plugin.prototype.destroy = function () {
            this.storage = [];
            this.element.remove();
            this.pipe.destroy();
            window.removeEventListener('resize', this.listenerResize);
            cancelAnimationFrame(this.animationID);
        };
        // Pauses/stops the particle animation.
        Plugin.prototype.pauseAnimation = function () {
            if (!this.animationID) {
                return;
            }
            cancelAnimationFrame(this.animationID);
            this.animationID = null;
        };
        // Restarts the particles animation by calling animate.
        Plugin.prototype.resumeAnimation = function () {
            if (!this.animationID) {
                this.animate();
            }
        };
        // Setup the canvas element.
        Plugin.prototype.initializeCanvas = function () {
            if (!this.options.selector) {
                console.warn('ak-kaleidoscope: No selector specified!' +
                    'Check https://github.com/kawakamiakari/kaleidoscope');
                return false;
            }
            this.element = document.querySelector(this.options.selector);
            this.context = this.element.getContext('2d');
            this.element.style.width = '100%';
            this.element.style.height = '100%';
            this.resize();
        };
        // Register event listeners.
        Plugin.prototype.initializeEvents = function () {
            var _this = this;
            this.listenerResize = function () {
                _this.resize();
                _this.pipe.resize();
            };
            window.addEventListener('resize', this.listenerResize);
        };
        // Initialize the pipe.
        Plugin.prototype.initializePipe = function () {
            this.pipe = new Pipe(this.context, this.options);
        };
        // Initialize the particle storage.
        Plugin.prototype.initializeStorage = function () {
            this.storage = [];
            for (var i = 0; i < this.options.quantity; i += 1) {
                this.storage.push(new Particle(this.context, this.options, this.pipe));
            }
        };
        // Animates the plugin particles by calling the draw method.
        Plugin.prototype.animate = function () {
            var _this = this;
            this.draw();
            this.animationID = requestAnimationFrame(function () { return _this.animate(); });
        };
        // Draws the plugin particles.
        Plugin.prototype.draw = function () {
            var _this = this;
            var element = this.element;
            var context = this.context;
            context.globalCompositeOperation = this.options.globalCompositeOperation;
            context.clearRect(0, 0, element.width, element.height);
            // Update the particles coordinates.
            this.storage.forEach(function (particle) { return particle.updateCoordinates(); });
            // Pop the particles what is NOT in the pipe and push the new particles.
            this.storage = this.storage.filter(function (particle) { return particle.isInPipe(); });
            for (var i = this.storage.length; i < this.options.quantity; i += 1) {
                this.storage.push(new Particle(this.context, this.options, this.pipe));
            }
            // Draw.
            for (var i = 0; i < this.options.edge; i += 1) {
                this.pipe.mirror(i, function () {
                    _this.storage.forEach(function (particle) { return particle.draw(); });
                });
            }
        };
        // Kick off various things on window resize.
        Plugin.prototype.resize = function () {
            this.element.width = this.element.offsetParent
                ? this.element.offsetParent.clientWidth
                : this.element.clientWidth;
            if (this.element.offsetParent &&
                this.element.offsetParent.nodeName === 'BODY') {
                this.element.height = window.innerHeight;
            }
            else {
                this.element.height = this.element.offsetParent
                    ? this.element.offsetParent.clientHeight
                    : this.element.clientHeight;
            }
        };
        return Plugin;
    }());
    return function (options) { return new Plugin(options); };
})();
(function () {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Kaleidoscope;
    }
    else {
        window.Kaleidoscope = Kaleidoscope;
    }
})();
exports["default"] = Kaleidoscope;
