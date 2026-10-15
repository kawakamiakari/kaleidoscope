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

## Options

| Option                     | Type            | Default                                                   | Description                                                                                                                                                                                  |
| -------------------------- | --------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector`                 | string          | -                                                         | _Required:_ The CSS selector of your canvas element                                                                                                                                          |
| `edge`                     | number          | `10`                                                      | _Optional:_ Amount of mirrors                                                                                                                                                                |
| `shapes`                   | string[]        | `['square', 'circle', 'wave']`                            | _Optional:_ Shapes of the particles. Choose from `'circle'`, `drop`, `'heart'`, `'oval'`, `'square'`, `'star'`, `'triangle'` or `'wave'`                                                     |
| `minSize`                  | number          | `30`                                                      | _Optional:_ Minimum amount of size of the particles                                                                                                                                          |
| `maxSize`                  | number          | `50`                                                      | _Optional:_ Maximum amount of size of the particles                                                                                                                                          |
| `color`                    | string[]        | `['#FFD1B9', '#564138', '#2E86AB', '#F5F749', '#F24236']` | _Optional:_ Colors of the particles                                                                                                                                                          |
| `globalCompositeOperation` | string          | `'overlay'`                                               | _Optional:_ Type of compositing operation to apply when drawing particles. Same as [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) |
| `quantity`                 | number          | `50`                                                      | _Optional:_ Amount of particles                                                                                                                                                              |
| `speed`                    | number (0 to 1) | `0.3`                                                     | _Optional:_ Movement speed of the particles                                                                                                                                                  |

## Methods

| Method            | Description                         |
| ----------------- | ----------------------------------- |
| `pauseAnimation`  | Pauses/stops the particle animation |
| `resumeAnimation` | Continues the particle animation    |
| `destroy`         | Destroys the plugin                 |
