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

  // happy-dom has no canvas rendering, so record properties and no-op methods.
  context = {};
  const proxy = new Proxy(context, {
    get: (target, key) => (key in target ? target[key as string] : () => {}),
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    proxy as unknown as CanvasRenderingContext2D,
  );
});

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
});
