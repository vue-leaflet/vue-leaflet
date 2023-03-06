import type L from "leaflet";
import type { PropType } from "vue";

import { propsToLeafletOptions } from "@src/utils";

import { layerProps, setupLayer } from "./layer";

/**
 * @typedef {import('leaflet/dist/leaflet-src.esm.js').LatLngBounds} LatLngBounds
 */

export const imageOverlayProps = {
  ...layerProps,
  opacity: {
    type: Number,
  },
  alt: {
    type: String,
  },
  interactive: {
    type: Boolean,
    default: undefined,
  },
  crossOrigin: {
    type: Boolean,
    default: undefined,
  },
  errorOverlayUrl: {
    type: String,
  },
  zIndex: {
    type: Number,
  },
  className: {
    type: String,
  },
  url: {
    type: String,
    required: true,
    custom: true,
  },
  bounds: {
    type: [Array, Object] as PropType<L.LatLngBoundsExpression>,
    required: true,
    custom: true,
  },
} as const;

export const setupImageOverlay = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.ImageOverlayOptions>(
    props,
    imageOverlayProps,
    layerOptions
  );

  const methods = {
    ...layerMethods,
    /**
     * Sets the opacity of the overlay.
     * @param {number} opacity
     */
    setOpacity(opacity) {
      return leafletRef.value.setOpacity(opacity);
    },
    /**
     * Changes the URL of the image.
     * @param {string} url
     */
    setUrl(url) {
      return leafletRef.value.setUrl(url);
    },
    /**
     * Update the bounds that this ImageOverlay covers
     * @param {LatLngBounds | Array<Array<number>>} bounds
     */
    setBounds(bounds) {
      return leafletRef.value.setBounds(bounds);
    },
    /**
     * Get the bounds that this ImageOverlay covers
     * @returns {LatLngBounds}
     */
    getBounds() {
      return leafletRef.value.getBounds();
    },
    /**
     * Returns the instance of HTMLImageElement used by this overlay.
     * @returns {HTMLElement}
     */
    getElement() {
      return leafletRef.value.getElement();
    },
    /**
     * Brings the layer to the top of all overlays.
     */
    bringToFront() {
      return leafletRef.value.bringToFront();
    },
    /**
     * Brings the layer to the bottom of all overlays.
     */
    bringToBack() {
      return leafletRef.value.bringToBack();
    },
    /**
     * Changes the zIndex of the image overlay.
     * @param {number} zIndex
     */
    setZIndex(zIndex) {
      return leafletRef.value.setZIndex(zIndex);
    },
  };

  return { options, methods };
};
