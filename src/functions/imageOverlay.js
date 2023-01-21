import { props as layerProps, setup as layerSetup } from "./layer";
/**
 * @typedef {import('leaflet/dist/leaflet-src.esm.js').LatLngBounds} LatLngBounds
 */

export const props = {
  ...layerProps,
  opacity: {
    type: Number,
  },
  alt: {
    type: String,
  },
  interactive: {
    type: Boolean,
  },
  crossOrigin: {
    type: Boolean,
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
    type: [Array, Object],
    required: true,
    custom: true,
  },
};

export const setup = (setupProps, LeafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
    setupProps,
    LeafletRef,
    context
  );
  const options = {
    ...layerOptions,
    ...setupProps,
  };

  const methods = {
    ...layerMethods,
    /**
     * Sets the opacity of the overlay.
     * @param {number} opacity
     */
    setOpacity(opacity) {
      return LeafletRef.value.setOpacity(opacity);
    },
    /**
     * Changes the URL of the image.
     * @param {string} url
     */
    setUrl(url) {
      return LeafletRef.value.setUrl(url);
    },
    /**
     * Update the bounds that this ImageOverlay covers
     * @param {LatLngBounds | Array<Array<number>>} bounds
     */
    setBounds(bounds) {
      return LeafletRef.value.setBounds(bounds);
    },
    /**
     * Get the bounds that this ImageOverlay covers
     * @returns {LatLngBounds}
     */
    getBounds() {
      return LeafletRef.value.getBounds();
    },
    /**
     * Returns the instance of HTMLImageElement used by this overlay.
     * @returns {HTMLElement}
     */
    getElement() {
      return LeafletRef.value.getElement();
    },
    /**
     * Brings the layer to the top of all overlays.
     */
    bringToFront() {
      return LeafletRef.value.bringToFront();
    },
    /**
     * Brings the layer to the bottom of all overlays.
     */
    bringToBack() {
      return LeafletRef.value.bringToBack();
    },
    /**
     * Changes the zIndex of the image overlay.
     * @param {number} zIndex
     */
    setZIndex(zIndex) {
      return LeafletRef.value.setZIndex(zIndex);
    },
  };

  return { options, methods };
};
