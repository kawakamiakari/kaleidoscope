const Kaleidoscope = (() => {
  interface IOptions {
    selector: string;
    edge?: number;
    shapes?: string[];
    minSize?: number;
    maxSize?: number;
    color?: string[];
    globalCompositeOperation?: string;
    quantity?: number;
    speed?: number;
  }

  // Merges the keys of two objects.
  function extend(
    source: { [index: string]: any },
    obj: { [index: string]: any },
  ) {
    Object.keys(obj).forEach((key: string) => {
      source[key] = obj[key];
    });
    return source;
  }

  function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  // Rotate the point around the center point.
  function rotate(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    rad: number,
  ) {
    const X =
      Math.cos(rad) * (x - centerX) - Math.sin(rad) * (y - centerY) + centerX;
    const Y =
      Math.sin(rad) * (x - centerX) + Math.cos(rad) * (y - centerY) + centerY;
    return { x: X, y: Y };
  }
  class Pipe {
    public directionX: number = 0;
    public directionY: number = 0;

    private options: IOptions = null;
    private context: CanvasRenderingContext2D = null;

    private radianAOB: number = 0;
    private pointO: { x: number; y: number } = { x: 0, y: 0 };
    private pointA: { x: number; y: number } = { x: 0, y: 0 };
    private pointB: { x: number; y: number } = { x: 0, y: 0 };

    private isSharp: boolean = null;
    private inclinationOA: number = 0;
    private interceptOA: number = 0;
    private inclinationOB: number = 0;
    private interceptOB: number = 0;
    private inclinationAB: number = 0;
    private interceptAB: number = 0;

    private listenerMousemove: (this: Window, ev: UIEvent) => any;

    constructor(context: CanvasRenderingContext2D, options: IOptions) {
      this.context = context;
      this.options = options;

      this.radianAOB = (2 * Math.PI) / options.edge;
      this.calculateBorder();

      this.initializeEvents();
    }

    // Get the center point of the kaleidoscope.
    public getPointO() {
      return this.pointO;
    }

    // Get the random point in the pipe.
    public getRandomCoordinates() {
      const x =
        getRandomInt(Math.max(this.pointO.x, this.pointB.x) - this.pointA.x) +
        this.pointA.x;

      let minY;
      let maxY;
      let y;
      if (this.isSharp) {
        minY = Math.max(
          this.inclinationOB * x + this.interceptOB,
          this.inclinationAB * x + this.interceptAB,
        );
        maxY = this.inclinationOA * x + this.interceptOA;
      } else {
        minY = this.inclinationAB * x + this.interceptAB;
        maxY = Math.min(
          this.inclinationOA * x + this.interceptOA,
          this.inclinationOB * x + this.interceptOB,
        );
      }
      y = getRandomInt(maxY - minY) + minY;

      return { x, y };
    }

    // Return whether the particle is in the pipe.
    public isIn(particle: Particle) {
      let retval = true;
      const x = particle.x;
      const y = particle.y;
      const size = particle.size * 2; // Oversized

      if (this.isSharp) {
        const minY = Math.max(
          this.inclinationOB * x + this.interceptOB,
          this.inclinationAB * x + this.interceptAB,
        );
        const maxY = this.inclinationOA * x + this.interceptOA;
        if (y - size > maxY || y + size < minY) {
          retval = false;
        }
      } else {
        const minY = this.inclinationAB * x + this.interceptAB;
        const maxY = Math.min(
          this.inclinationOA * x + this.interceptOA,
          this.inclinationOB * x + this.interceptOB,
        );
        if (y - size > maxY || y + size < minY) {
          retval = false;
        }
      }

      return retval;
    }

    // Draw on a mirror surface.
    public mirror(index: number, drawFunc: () => void) {
      const context = this.context;

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
    }

    // destroy the object.
    public destroy() {
      window.removeEventListener('mousemove', this.listenerMousemove);
    }

    // Kick off various things on window resize.
    public resize() {
      this.calculateBorder();
    }

    // Register event listeners.
    private initializeEvents() {
      this.listenerMousemove = (event: MouseEvent) => {
        const unit = Math.sqrt(
          (event.clientX - this.pointO.x) ** 2 +
            (event.clientY - this.pointO.y) ** 2,
        );
        if (unit === 0) return;

        this.directionX = (event.clientX - this.pointO.x) / unit;
        this.directionY = (event.clientY - this.pointO.y) / unit;

        const element = document.querySelector(this.options.selector);
        element.dispatchEvent(new Event('change:direction'));
      };
      window.addEventListener('mousemove', this.listenerMousemove);
    }

    // Calculate the formula for the border.
    private calculateBorder() {
      const canvas: HTMLCanvasElement = document.querySelector(
        this.options.selector,
      );
      this.pointO.x = canvas.offsetParent
        ? canvas.offsetParent.clientWidth / 2
        : canvas.clientWidth / 2;
      if (canvas.offsetParent && canvas.offsetParent.nodeName === 'BODY') {
        this.pointO.y = window.innerHeight / 2;
      } else {
        this.pointO.y = canvas.offsetParent
          ? canvas.offsetParent.clientHeight / 2
          : canvas.clientHeight / 2;
      }
      const diagonal = Math.sqrt(this.pointO.x ** 2 + this.pointO.y ** 2);
      const radius = diagonal / Math.cos(this.radianAOB / 2);
      this.pointA = {
        x: (1 - radius / diagonal) * this.pointO.x,
        y: (1 - radius / diagonal) * this.pointO.y,
      };
      this.pointB = rotate(
        this.pointA.x,
        this.pointA.y,
        this.pointO.x,
        this.pointO.y,
        this.radianAOB,
      );

      const pointO = this.pointO;
      const pointA = this.pointA;
      const pointB = this.pointB;

      this.isSharp = pointB.x < this.pointO.x;
      this.inclinationOA = (pointA.y - pointO.y) / (pointA.x - pointO.x);
      this.interceptOA = pointO.y - this.inclinationOA * pointO.x;
      this.inclinationOB = (pointB.y - pointO.y) / (pointB.x - pointO.x);
      this.interceptOB = pointO.y - this.inclinationOB * pointO.x;
      this.inclinationAB = (pointB.y - pointA.y) / (pointB.x - pointA.x);
      this.interceptAB = pointA.y - this.inclinationAB * pointA.x;
    }
  }
  class Particle {
    public size: number = 0;
    public x: number = 0;
    public y: number = 0;

    private options: IOptions = null;
    private context: CanvasRenderingContext2D = null;
    private pipe: Pipe = null;

    private shape: string = null;
    private color: string = null;
    private opacity: number = 0;
    private v: number = 0;
    private radian: number = (2 * Math.PI) / (getRandomInt(6) + 1);
    private directionX: number = 0;
    private directionY: number = 0;

    constructor(
      context: CanvasRenderingContext2D,
      options: IOptions,
      pipe: Pipe,
    ) {
      this.context = context;
      this.options = options;
      this.pipe = pipe;

      this.shape = options.shapes[getRandomInt(options.shapes.length)];
      this.size =
        getRandomInt(options.maxSize - options.minSize) + options.minSize;
      this.color = options.color[getRandomInt(options.color.length)];
      const p = pipe.getRandomCoordinates();
      this.x = p.x;
      this.y = p.y;
      this.v = (Math.random() + 0.5) * options.speed;
      this.directionX = pipe.directionX;
      this.directionY = pipe.directionY;

      this.initializeEvents();
    }

    // The particles draw function.
    public draw() {
      const context = this.context;
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
          context.quadraticCurveTo(
            this.size * (2 / 3),
            this.size * (1 / 3),
            this.size * (2 / 3),
            this.size * (2 / 3),
          );
          context.arc(
            this.size * (1 / 3),
            this.size * (2 / 3),
            this.size * (1 / 3),
            0,
            Math.PI,
            false,
          );
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
          context.bezierCurveTo(
            this.size * (75 / 130),
            this.size * (37 / 140),
            this.size * (70 / 130),
            this.size * (25 / 140),
            this.size * (50 / 130),
            this.size * (25 / 140),
          );
          context.bezierCurveTo(
            this.size * (20 / 130),
            this.size * (25 / 140),
            this.size * (20 / 130),
            this.size * (62.5 / 140),
            this.size * (20 / 130),
            this.size * (62.5 / 140),
          );
          context.bezierCurveTo(
            this.size * (20 / 130),
            this.size * (80 / 140),
            this.size * (40 / 130),
            this.size * (102 / 140),
            this.size * (75 / 130),
            this.size * (120 / 140),
          );
          context.bezierCurveTo(
            this.size * (110 / 130),
            this.size * (102 / 140),
            this.size,
            this.size * (80 / 140),
            this.size,
            this.size * (62.5 / 140),
          );
          context.bezierCurveTo(
            this.size,
            this.size * (62.5 / 140),
            this.size,
            this.size * (25 / 140),
            this.size * (100 / 130),
            this.size * (25 / 140),
          );
          context.bezierCurveTo(
            this.size * (85 / 130),
            this.size * (25 / 140),
            this.size * (75 / 130),
            this.size * (37 / 140),
            this.size * (75 / 130),
            this.size * (40 / 140),
          );
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
          context.translate(
            this.x + this.size / 2,
            this.y + this.size * (9 / 10),
          );
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
          context.translate(
            this.x + this.size / 2,
            this.y + (1 - Math.tan(Math.PI / 6) / 2) * this.size,
          );
          context.rotate(this.radian);
          context.translate(
            -(this.size / 2),
            -((1 - Math.tan(Math.PI / 6) / 2) * this.size),
          );

          // Draw
          context.beginPath();
          context.moveTo(0, this.size);
          context.lineTo(
            this.size / 2,
            (1 - Math.tan(Math.PI / 3) / 2) * this.size,
          );
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
    }

    // This updates the particles coordinates.
    public updateCoordinates() {
      if (this.opacity < 1) {
        this.opacity += 0.1;
      }

      if (this.directionX && this.directionY) {
        this.x += this.v * this.directionX;
        this.y += this.v * this.directionY;
      } else {
        this.y += this.v;
      }

      this.radian += this.v * 0.002 * Math.PI;
    }

    public isInPipe() {
      return this.pipe.isIn(this);
    }

    // Register event listeners.
    private initializeEvents() {
      const element = document.querySelector(this.options.selector);
      element.addEventListener('change:direction', () => {
        this.directionX = this.pipe.directionX;
        this.directionY = this.pipe.directionY;
      });
    }
  }
  class Plugin {
    private options: IOptions = null;
    private defaults: IOptions = {
      color: ['#FFD1B9', '#564138', '#2E86AB', '#F5F749', '#F24236'],
      edge: 10,
      globalCompositeOperation: 'overlay',
      maxSize: 50,
      minSize: 30,
      quantity: 50,
      selector: null,
      shapes: ['square', 'circle', 'wave'],
      speed: 0.3,
    };

    private element: HTMLCanvasElement = null;
    private context: CanvasRenderingContext2D = null;
    private animationID: number = null;
    private pipe: Pipe = null;
    private storage: Particle[] = [];

    private listenerResize: (this: Window, ev: UIEvent) => any;

    // Initialize the plugin with user settings.
    constructor(settings: IOptions) {
      this.options = extend({ ...this.defaults }, settings) as IOptions;

      this.initializeCanvas();
      this.initializeEvents();
      this.initializePipe();
      this.initializeStorage();
      this.animate();
    }

    // destroy the plugin.
    public destroy() {
      this.storage = [];
      this.element.remove();
      this.pipe.destroy();

      window.removeEventListener('resize', this.listenerResize);
      cancelAnimationFrame(this.animationID);
    }

    // Pauses/stops the particle animation.
    public pauseAnimation() {
      if (!this.animationID) {
        return;
      }

      cancelAnimationFrame(this.animationID);
      this.animationID = null;
    }

    // Restarts the particles animation by calling animate.
    public resumeAnimation() {
      if (!this.animationID) {
        this.animate();
      }
    }

    // Setup the canvas element.
    private initializeCanvas() {
      if (!this.options.selector) {
        console.warn(
          'ak-kaleidoscope: No selector specified!' +
            'Check https://github.com/kawakamiakari/kaleidoscope',
        );
        return false;
      }

      this.element = document.querySelector(this.options.selector);
      this.context = this.element.getContext('2d');

      this.element.style.width = '100%';
      this.element.style.height = '100%';

      this.resize();
    }

    // Register event listeners.
    private initializeEvents() {
      this.listenerResize = () => {
        this.resize();
        this.pipe.resize();
      };
      window.addEventListener('resize', this.listenerResize);
    }

    // Initialize the pipe.
    private initializePipe() {
      this.pipe = new Pipe(this.context, this.options);
    }

    // Initialize the particle storage.
    private initializeStorage() {
      this.storage = [];

      for (let i = 0; i < this.options.quantity; i += 1) {
        this.storage.push(new Particle(this.context, this.options, this.pipe));
      }
    }

    // Animates the plugin particles by calling the draw method.
    private animate() {
      this.draw();
      this.animationID = requestAnimationFrame(() => this.animate());
    }

    // Draws the plugin particles.
    private draw() {
      const element = this.element;
      const context = this.context;

      context.globalCompositeOperation = this.options.globalCompositeOperation;
      context.clearRect(0, 0, element.width, element.height);

      // Update the particles coordinates.
      this.storage.forEach(particle => particle.updateCoordinates());

      // Pop the particles what is NOT in the pipe and push the new particles.
      this.storage = this.storage.filter(particle => particle.isInPipe());
      for (let i = this.storage.length; i < this.options.quantity; i += 1) {
        this.storage.push(new Particle(this.context, this.options, this.pipe));
      }

      // Draw.
      for (let i = 0; i < this.options.edge; i += 1) {
        this.pipe.mirror(i, () => {
          this.storage.forEach(particle => particle.draw());
        });
      }
    }

    // Kick off various things on window resize.
    private resize() {
      this.element.width = this.element.offsetParent
        ? this.element.offsetParent.clientWidth
        : this.element.clientWidth;
      if (
        this.element.offsetParent &&
        this.element.offsetParent.nodeName === 'BODY'
      ) {
        this.element.height = window.innerHeight;
      } else {
        this.element.height = this.element.offsetParent
          ? this.element.offsetParent.clientHeight
          : this.element.clientHeight;
      }
    }
  }

  return (options: IOptions) => new Plugin(options);
})();

interface IWindow extends Window {
  Kaleidoscope: any;
}
declare let window: IWindow;

(() => {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Kaleidoscope;
  } else {
    window.Kaleidoscope = Kaleidoscope;
  }
})();

export default Kaleidoscope;
