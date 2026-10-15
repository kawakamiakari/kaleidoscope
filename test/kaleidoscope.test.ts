import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Kaleidoscope from '../src/kaleidoscope';

const shapes = [
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
