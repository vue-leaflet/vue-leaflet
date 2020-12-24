---
title: LMap
---

# LMap

---

## Props

| Prop name              | Description                                    | Type          | Values         | Default      |
| ---------------------- | ---------------------------------------------- | ------------- | -------------- | ------------ |
| center                 | The center of the map, supports .sync modifier | object\|array | -              | () => [0, 0] |
| bounds                 | The bounds of the map, supports .sync modifier | array\|object | -              | undefined    |
| maxBounds              | The max bounds of the map                      | array\|object | -              | undefined    |
| zoom                   | The zoom of the map, supports .sync modifier   | number        | -              | 0            |
| minZoom                | The minZoom of the map                         | number        | -              | undefined    |
| maxZoom                | The maxZoom of the map                         | number        | -              | undefined    |
| paddingBottomRight     | The paddingBottomRight of the map              | array         | -              | undefined    |
| paddingTopLeft         | The paddingTopLeft of the map                  | array         | -              | undefined    |
| padding                | The padding of the map                         | array         | -              | undefined    |
| worldCopyJump          | The worldCopyJump option for the map           | boolean       | -              | false        |
| crs                    | The crs option for the map                     | object        | `CRS.EPSG3857` |              |
| maxBoundsViscosity     |                                                | number        | -              | undefined    |
| inertia                |                                                | boolean       | -              | undefined    |
| inertiaDeceleration    |                                                | number        | -              | undefined    |
| inertiaMaxSpeed        |                                                | number        | -              | undefined    |
| easeLinearity          |                                                | number        | -              | undefined    |
| zoomAnimation          |                                                | boolean       | -              | undefined    |
| zoomAnimationThreshold |                                                | number        | -              | undefined    |
| fadeAnimation          |                                                | boolean       | -              | undefined    |
| markerZoomAnimation    |                                                | boolean       | -              | undefined    |
| noBlockingAnimations   |                                                | boolean       | -              | false        |

## Slots

| Name    | Description | Bindings |
| ------- | ----------- | -------- |
| default |             |          |
