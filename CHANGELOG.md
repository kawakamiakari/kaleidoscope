# Changelog

## Unreleased

### Added

- `shapes` is typed as a union of the available shape names, so typos are caught at compile time.
- Options have TSDoc comments with their defaults.
- `Kaleidoscope.Shape` and `Kaleidoscope.Instance` types.
- `shapes` and `color` accept readonly arrays (e.g. `as const`).

## 2.0.1 - 2026-10-16

### Fixed

- Fixed a memory leak where every new particle added an event listener to the canvas that was never removed.

## 2.0.0 - 2026-10-16

### Breaking changes

- The build now targets ES2018. Internet Explorer is no longer supported.
- Throws an `Error` when `selector` is missing or no canvas matches it, instead of logging a warning and failing later.
- `globalCompositeOperation` is typed as `GlobalCompositeOperation` instead of `string`.
- `dist/` is no longer committed to the repository. Use npm, a CDN, or the file attached to each GitHub release.

### Fixed

- The browser build no longer throws `ReferenceError: exports is not defined` when loaded with a `<script>` tag.

### Added

- ES module build and TypeScript type definitions. The options type is available as `Kaleidoscope.Options`.

## 1.1.0 - 2021-07-06

## 1.0.0 - 2020-02-06
