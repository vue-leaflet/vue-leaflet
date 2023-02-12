# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.8.3] - 2023-02-12

### Fixed

- The marker icon passed to the Leaflet constructor is now only replaced with an empty div when there is
  additional content within the `<LMarker>` component, _and_ at least some of that content is something
  other than a tooltip or popup, resolving
  [#269 Marker with tooltip no longer visible with v0.8.2](https://github.com/vue-leaflet/vue-leaflet/issues/269).
- Tweaked how popups and tooltips are unbound when they unmount, resolving
  [#266 Vue-leaflet LPopup does not update with prop change](https://github.com/vue-leaflet/vue-leaflet/issues/266).

### Changed

- Leaflet objects accessed via the `leafletObject` property of a `ref` are now all marked as raw, so they
  no longer return `Proxy` instances.

### Added

- Ability to style GeoJSON layers through `:options-style` prop.


## [0.8.2] - 2023-02-05

### Fixed

- Debounced event handlers are now cleared on unmount, resolving
  [#231 Possible Regression](https://github.com/vue-leaflet/vue-leaflet/issues/231).
- Reworked attribution update handler to resolve
  [#165 Error when updating attribution prop for tileLayer](https://github.com/vue-leaflet/vue-leaflet/issues/165).
- Default Leaflet icon is replaced by an empty div initially when a Marker has content in its slot that has not
  yet rendered, resolving
  [#170 Blinking default marker when using custom icon component](https://github.com/vue-leaflet/vue-leaflet/issues/170).
- Resolved [#138 vue3 this.$slots.default is not a function](https://github.com/vue-leaflet/vue-leaflet/issues/138).

### Changed

- `LTileLayer` now accepts an array of strings for its `subdomains` property, as well as a single string.
- `LWmsTileLayer` now uses the correct Leaflet option name `uppercase` instead of the previous `upperCase`.


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