# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Fixed

- Debounced event handlers are now cleared on unmount, resolving
  [#231 Possible Regression](https://github.com/vue-leaflet/vue-leaflet/issues/231).
- Reworked attribution update handler to resolve
  [#165 Error when updating attribution prop for tileLayer](https://github.com/vue-leaflet/vue-leaflet/issues/165).
- Default Leaflet icon is replaced by an empty div initially when a Marker has content in its slot that has not
  yet rendered, resolving
  [#170 Blinking default marker when using custom icon component](https://github.com/vue-leaflet/vue-leaflet/issues/170).


## [0.8.1] - 2023-01-29

### Fixed

- Resolved [#265 TypeError: this.getPane() is undefined](https://github.com/vue-leaflet/vue-leaflet/issues/265).


## [0.8.0] - 2023-01-26

### Added

- Import of Leaflet CSS in quickstart.
- Example of using HTML inside an `LIcon` component, to create a `DivIcon`.

### Fixed

- Leaflet component defaults are no longer replaced with `undefined` when not set explicitly.
- Resolved some errors caused by event handlers attempting to run after components had unmounted.

### Changed

- **Breaking:** `LWmsTileLayer` no longer has its own `baseUrl` property in addition to the `url` property it inherits
  from `LTileLayer`.


## [0.7.0] - 2022-12-08

### Breaking changes

- The `<l-map>` component now uses the globally available `window.L` instance of Leaflet by default.
  If you are using SSR in an existing project and relying on the default behaviour, you will now need to pass
  `:useGlobalLeaflet="false"` to your `<l-map>`.

### Added

- This changelog file.
- Quickstart and SSR sections in readme.

### Changed

- Minor additional updates to the readme.
- Code formatting in some playground examples.
- Moved `@types/leaflet` to `devDependencies`.


## Earlier versions

The following releases were created before the addition of this changelog:

* [0.6.1], 2021-06-17
* [0.6.0], 2021-03-01
* [0.5.0], 2020-11-29
* [0.4.2], 2020-11-16
* [0.4.1], 2020-11-16
* [0.4.0], 2020-11-13
* [0.3.0], 2020-10-31
* [0.2.0], 2020-10-30
* [0.1.2], 2020-10-09


[unreleased]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/vue-leaflet/vue-leaflet/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/vue-leaflet/vue-leaflet/releases/tag/v0.1.2