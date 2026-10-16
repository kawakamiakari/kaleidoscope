import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Kaleidoscope from '../src/kaleidoscope';

const shapes: Kaleidoscope.Shape[] = [
  'circle',
  'drop',
  'heart',
  'oval',
  'square',
  'star',
  'triangle',
  'wave',
];

let frames: FrameRequestCallback[];
let context: Record<string, unknown>;
let calls: { name: string; args: unknown[] }[];

// Runs the queued animation frames.
function tick(count = 1) {
  for (let i = 0; i < count; i += 1) {
    const queued = frames;
    frames = [];
    queued.forEach((callback) => callback(0));
  }
}

beforeEach(() => {
  document.body.innerHTML = '<canvas id="kaleidoscope"></canvas>';
  // happy-dom has no layout, so give the canvas a size.
  const canvas = document.querySelector('#kaleidoscope') as HTMLElement;
  Object.defineProperty(canvas, 'clientWidth', { value: 800 });
  Object.defineProperty(canvas, 'clientHeight', { value: 600 });

  frames = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  // happy-dom has no Path2D.
  vi.stubGlobal(
    'Path2D',
    class {
      constructor(public d: string) {}
    },
  );

  // happy-dom has no canvas rendering, so record properties and method calls.
  context = {};
  calls = [];
  const proxy = new Proxy(context, {
    get: (target, key) =>
      key in target
        ? target[key as string]
        : (...args: unknown[]) => calls.push({ name: String(key), args }),
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    proxy as unknown as CanvasRenderingContext2D,
  );
});

// Mocks the prefers-reduced-motion media query and returns a setter for it.
function mockReducedMotion(initial: boolean) {
  const listeners: (() => void)[] = [];
  const query = {
    matches: initial,
    addEventListener: (_type: string, listener: () => void) =>
      listeners.push(listener),
    removeEventListener: vi.fn(),
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(
    query as unknown as MediaQueryList,
  );
  return (matches: boolean) => {
    query.matches = matches;
    listeners.forEach((listener) => listener());
  };
}

function called(name: string) {
  return calls.some((call) => call.name === name);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Kaleidoscope', () => {
  it('can be called with or without new', () => {
    const a = new Kaleidoscope({ selector: '#kaleidoscope' });
    const b = Kaleidoscope({ selector: '#kaleidoscope' });

    expect(a).toBeTypeOf('object');
    expect(b).toBeTypeOf('object');
    expect(a.constructor).toBe(b.constructor);
  });

  it('types the options', () => {
    const shapes = ['heart', 'star'] as const;
    new Kaleidoscope({ selector: '#kaleidoscope', shapes });

    // @ts-expect-error -- unknown shape
    new Kaleidoscope({ selector: '#kaleidoscope', shapes: ['hexagon'] });

    const custom: Kaleidoscope.ShapeDefinition[] = [
      { path: 'M0 0 L24 24' },
      { path: 'M0 0', viewBox: '0 0 10 10', style: 'stroke', lineWidth: 2 },
      (context, size) => context.fillRect(0, 0, size, size),
    ];
    new Kaleidoscope({
      selector: '#kaleidoscope',
      shapes: ['circle', ...custom],
    });
  });

  it('throws when the selector is missing', () => {
    expect(() => new Kaleidoscope({ selector: '' })).toThrow(
      /No selector specified/,
    );
  });

  it('throws when the canvas is not found', () => {
    expect(() => new Kaleidoscope({ selector: '#missing' })).toThrow(
      /No canvas element found for "#missing"/,
    );
  });

  it('stretches the canvas to its container', () => {
    new Kaleidoscope({ selector: '#kaleidoscope' });
    const canvas = document.querySelector<HTMLCanvasElement>('#kaleidoscope');

    expect(canvas?.style.width).toBe('100%');
    expect(canvas?.style.height).toBe('100%');
  });

  it('draws every shape without errors', () => {
    new Kaleidoscope({ selector: '#kaleidoscope', shapes });

    expect(() => tick(100)).not.toThrow();
  });

  it('does not add listeners as particles are replaced', () => {
    const canvas = document.querySelector('#kaleidoscope') as HTMLCanvasElement;
    const addEventListener = vi.spyOn(canvas, 'addEventListener');
    new Kaleidoscope({ selector: '#kaleidoscope', quantity: 10 });

    tick(100);

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('moves particles toward the mouse', () => {
    const kaleidoscope = new Kaleidoscope({
      selector: '#kaleidoscope',
      quantity: 1,
    });
    const particle = () =>
      (kaleidoscope as unknown as { storage: { x: number; y: number }[] })
        .storage[0];
    const before = { ...particle() };

    window.dispatchEvent(
      new MouseEvent('mousemove', { clientX: -1000, clientY: -1000 }),
    );
    tick();

    expect(particle().x).toBeLessThan(before.x);
    expect(particle().y).toBeLessThan(before.y);
  });

  it('applies globalCompositeOperation', () => {
    new Kaleidoscope({
      selector: '#kaleidoscope',
      globalCompositeOperation: 'multiply',
    });

    expect(context.globalCompositeOperation).toBe('multiply');
  });

  it('pauses and resumes the animation', () => {
    const kaleidoscope = new Kaleidoscope({ selector: '#kaleidoscope' });

    kaleidoscope.pauseAnimation();
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);

    frames = [];
    kaleidoscope.resumeAnimation();
    expect(frames).toHaveLength(1);
  });

  it('cleans up on destroy', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const kaleidoscope = new Kaleidoscope({ selector: '#kaleidoscope' });

    kaleidoscope.destroy();

    expect(document.querySelector('#kaleidoscope')).toBeNull();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
  });

  describe('pixel ratio', () => {
    it('scales the canvas by devicePixelRatio, up to 2', () => {
      vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(3);
      new Kaleidoscope({ selector: '#kaleidoscope' });
      const canvas = document.querySelector(
        '#kaleidoscope',
      ) as HTMLCanvasElement;

      expect(canvas.width).toBe(1600);
      expect(canvas.height).toBe(1200);
      expect(calls).toContainEqual({
        name: 'setTransform',
        args: [2, 0, 0, 2, 0, 0],
      });
    });

    it('uses the pixelRatio option', () => {
      vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(3);
      new Kaleidoscope({ selector: '#kaleidoscope', pixelRatio: 1 });
      const canvas = document.querySelector(
        '#kaleidoscope',
      ) as HTMLCanvasElement;

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });
  });

  describe('reduced motion', () => {
    it('draws a still image without animating', () => {
      mockReducedMotion(true);
      new Kaleidoscope({ selector: '#kaleidoscope' });

      expect(frames).toHaveLength(0);
      expect(called('clearRect')).toBe(true);
      expect(called('fill') || called('stroke')).toBe(true);
    });

    it('follows changes of the preference', () => {
      const setReducedMotion = mockReducedMotion(true);
      new Kaleidoscope({ selector: '#kaleidoscope' });

      setReducedMotion(false);
      expect(frames).toHaveLength(1);

      setReducedMotion(true);
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it('stays paused when paused by the user', () => {
      const setReducedMotion = mockReducedMotion(false);
      const kaleidoscope = new Kaleidoscope({ selector: '#kaleidoscope' });
      kaleidoscope.pauseAnimation();
      frames = [];

      setReducedMotion(true);
      setReducedMotion(false);

      expect(frames).toHaveLength(0);
    });

    it('can be ignored with respectReducedMotion: false', () => {
      mockReducedMotion(true);
      new Kaleidoscope({
        selector: '#kaleidoscope',
        respectReducedMotion: false,
      });

      expect(frames).toHaveLength(1);
    });
  });

  it('redraws on resize while paused', () => {
    const kaleidoscope = new Kaleidoscope({ selector: '#kaleidoscope' });
    kaleidoscope.pauseAnimation();
    calls = [];

    window.dispatchEvent(new Event('resize'));

    expect(called('clearRect')).toBe(true);
  });

  describe('custom shapes', () => {
    // Creates an instance drawing one shape at a fixed size and returns the
    // canvas calls made while drawing a frame.
    function drawShape(shape: Kaleidoscope.ShapeDefinition, size = 48) {
      new Kaleidoscope({
        selector: '#kaleidoscope',
        shapes: [shape],
        minSize: size,
        maxSize: size,
        quantity: 1,
        edge: 1,
      });
      calls = [];
      tick();
      return calls;
    }

    it('fills an SVG path scaled to the particle size', () => {
      const drawn = drawShape({ path: 'M2 2 L22 22' });

      expect(drawn).toContainEqual({ name: 'scale', args: [2, 2] });
      expect(drawn).toContainEqual({ name: 'translate', args: [-12, -12] });
      const fill = drawn.find((call) => call.name === 'fill');
      expect(fill?.args[0]).toEqual({ d: 'M2 2 L22 22' });
    });

    it('fits a viewBox string, centered', () => {
      const drawn = drawShape({ path: 'M0 0', viewBox: '0 0 96 48' });

      expect(drawn).toContainEqual({ name: 'scale', args: [0.5, 0.5] });
      expect(drawn).toContainEqual({ name: 'translate', args: [-48, -24] });
    });

    it('strokes a path', () => {
      const drawn = drawShape({ path: 'M0 0', style: 'stroke' });

      expect(drawn.some((call) => call.name === 'stroke')).toBe(true);
      expect(drawn.some((call) => call.name === 'fill')).toBe(false);
      expect(context.lineWidth).toBe(2.4);
    });

    it('uses lineWidth for strokes', () => {
      drawShape({ path: 'M0 0', style: 'stroke', lineWidth: 3 });

      expect(context.lineWidth).toBe(3);
    });

    it('calls a drawing function with the context and size', () => {
      const shape = vi.fn();
      drawShape(shape, 40);

      expect(shape).toHaveBeenCalledWith(expect.anything(), 40);
    });
  });
});
