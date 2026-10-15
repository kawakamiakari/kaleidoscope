# Changelog

## Unreleased

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
