# ak-kaleidoscope

[![npm version](https://img.shields.io/npm/v/ak-kaleidoscope.svg)](https://www.npmjs.com/package/ak-kaleidoscope)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/ak-kaleidoscope.svg)](https://bundlephobia.com/package/ak-kaleidoscope)

ak-kaleidoscope is a lightweight JavaScript plugin for particle backgrounds.

## Demo

See [demo page](https://kawakamiakari.github.io/kaleidoscope/).  
The examples code can be found in the `docs/` folder.

## Installation

### CDN

Include the script in your HTML (right before the closing body tag).

```html
<body>
  ...
  <canvas id="kaleidoscope"></canvas>
  <script src="https://cdn.jsdelivr.net/npm/ak-kaleidoscope@2/dist/kaleidoscope.min.js"></script>
</body>
```

The minified file is also attached to each [GitHub release](https://github.com/kawakamiakari/kaleidoscope/releases) if you prefer to host it yourself.

### npm

```sh
npm install ak-kaleidoscope
```

```javascript
import Kaleidoscope from 'ak-kaleidoscope';
```

## Usage

Add a few styles to your css.

```css
html,
body {
  margin: 0;
  padding: 0;
}

#kaleidoscope {
  position: absolute;
  display: block;
  top: 0;
  left: 0;
}
```

Initialize the plugin on the `window.onload` event.

```javascript
window.onload = function () {
  new Kaleidoscope({
    selector: '#kaleidoscope',
  });
};
```

### ES modules / TypeScript

Type definitions are included. Option types are available as `Kaleidoscope.Options`.

```typescript
import Kaleidoscope from 'ak-kaleidoscope';

const options: Kaleidoscope.Options = {
  selector: '#kaleidoscope',
  shapes: ['heart', 'star'],
};

const kaleidoscope = new Kaleidoscope(options);
```

When the canvas is mounted and unmounted dynamically, such as in a component framework, call `destroy()` on unmount to stop the animation and remove the event listeners. For example, in React:

```tsx
useEffect(() => {
  const kaleidoscope = new Kaleidoscope({ selector: '#kaleidoscope' });
  return () => kaleidoscope.destroy();
}, []);
```

Note that `destroy()` also removes the canvas element from the DOM.

## Options

| Option                     | Type                             | Default                                                   | Description                                                                                                                                                                                       |
| -------------------------- | -------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector`                 | string                           | -                                                         | _Required:_ The CSS selector of your canvas element                                                                                                                                               |
| `edge`                     | number                           | `10`                                                      | _Optional:_ Amount of mirrors                                                                                                                                                                     |
| `shapes`                   | (string \| object \| function)[] | `['square', 'circle', 'wave']`                            | _Optional:_ Shapes of the particles. Choose from `'circle'`, `'drop'`, `'heart'`, `'oval'`, `'square'`, `'star'`, `'triangle'` or `'wave'`, or add your own (see [Custom shapes](#custom-shapes)) |
| `minSize`                  | number                           | `30`                                                      | _Optional:_ Minimum amount of size of the particles                                                                                                                                               |
| `maxSize`                  | number                           | `50`                                                      | _Optional:_ Maximum amount of size of the particles                                                                                                                                               |
| `color`                    | string[]                         | `['#FFD1B9', '#564138', '#2E86AB', '#F5F749', '#F24236']` | _Optional:_ Colors of the particles                                                                                                                                                               |
| `globalCompositeOperation` | string                           | `'overlay'`                                               | _Optional:_ Type of compositing operation to apply when drawing particles. Same as [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)      |
| `quantity`                 | number                           | `50`                                                      | _Optional:_ Amount of particles                                                                                                                                                                   |
| `speed`                    | number (0 to 1)                  | `0.3`                                                     | _Optional:_ Movement speed of the particles                                                                                                                                                       |
| `pixelRatio`               | number                           | `Math.min(devicePixelRatio, 2)`                           | _Optional:_ Resolution multiplier of the canvas. Higher values look sharper on high-DPI screens but cost more to draw                                                                             |
| `respectReducedMotion`     | boolean                          | `true`                                                    | _Optional:_ Show a still image instead of animating when the user [prefers reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)                        |

## Custom shapes

Besides the built-in names, `shapes` accepts your own shapes. Mix them freely:

```javascript
new Kaleidoscope({
  selector: '#kaleidoscope',
  shapes: [
    'circle',

    // An SVG path, e.g. the `d` attribute of a 24x24 icon.
    {
      path: 'M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z',
    },

    // Outline only.
    { path: 'M3 12h18M12 3v18', style: 'stroke', lineWidth: 4 },

    // A drawing function for anything else.
    (context, size) => {
      context.beginPath();
      context.ellipse(0, 0, size / 2, size / 5, 0, 0, 2 * Math.PI);
      context.fill();
    },
  ],
});
```

**SVG path** objects take these properties:

| Property    | Type                   | Default           | Description                                                                                    |
| ----------- | ---------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `path`      | string                 | -                 | _Required:_ SVG path data                                                                      |
| `viewBox`   | number \| string       | `24`              | _Optional:_ Coordinate system of the path, as a size (`24`) or an SVG viewBox (`'0 0 100 50'`) |
| `style`     | `'fill'` \| `'stroke'` | `'fill'`          | _Optional:_ Fill the path or draw its outline                                                  |
| `lineWidth` | number                 | viewBox size / 10 | _Optional:_ Line width for `'stroke'`, in viewBox units                                        |

The path is scaled to the particle size and centered.

**Drawing functions** receive the canvas context and the particle size. Draw the shape centered on the origin (`0, 0`) within `size`, and call `fill()` or `stroke()` yourself. Position, rotation, opacity and the color (`fillStyle` and `strokeStyle`) are already applied.

In TypeScript, the type of a shape definition is `Kaleidoscope.ShapeDefinition`.

## Methods

| Method            | Description                         |
| ----------------- | ----------------------------------- |
| `pauseAnimation`  | Pauses/stops the particle animation |
| `resumeAnimation` | Continues the particle animation    |
| `destroy`         | Destroys the plugin                 |

## Migrating from 1.x

- **Browser support**: the build targets ES2018. Internet Explorer is no longer supported.
- **Where to get the file**: `dist/` is no longer committed to the repository. Load it from a CDN, install it from npm, or download `kaleidoscope.min.js` from the [GitHub releases](https://github.com/kawakamiakari/kaleidoscope/releases).
- **Errors**: a missing `selector`, or a selector that matches no canvas, now throws an `Error` instead of logging a warning.
- **Reduced motion**: when the user prefers reduced motion, a still image is shown instead of the animation. Pass `respectReducedMotion: false` to keep the 1.x behavior.
- **TypeScript**: `shapes` only accepts the shape names listed above, and `globalCompositeOperation` only accepts valid canvas values.

See the [changelog](CHANGELOG.md) for all changes.
