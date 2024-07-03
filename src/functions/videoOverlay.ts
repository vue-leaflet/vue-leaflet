import type L from "leaflet";
import type { PropType } from "vue";

import { propsToLeafletOptions } from "@src/utils";

import { imageOverlayProps, setupImageOverlay } from "./imageOverlay";

/**
 * @typedef {import('leaflet/dist/leaflet-src.esm.js').LatLngBounds} LatLngBounds
 */

export const videoOverlayProps = {
  ...imageOverlayProps,
  url: {
    type: [String, Array, HTMLVideoElement] as PropType<
      string | string[] | HTMLVideoElement
    >,
    required: true,
    custom: true,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
  loop: {
    type: Boolean,
    default: true,
  },
  keepAspectRatio: {
    type: Boolean,
    default: true,
  },
  muted: {
    type: Boolean,
    default: false,
  },
  playsInline: {
    type: Boolean,
    default: true,
  },
} as const;

export const setupVideoOverlay = (props, leafletRef, context) => {
  const { options: imageOverlayProps, methods: imageOverlayMethods } =
    setupImageOverlay(props, leafletRef, context);

  const options = propsToLeafletOptions<L.VideoOverlayOptions>(
    props,
    videoOverlayProps,
    imageOverlayProps
  );

  const methods = {
    ...imageOverlayMethods,
    /**
     * Returns the instance of HTMLVideoElement used by this overlay.
     * @returns {HTMLVideoElement}
     */
    getElement() {
      return leafletRef.value.getElement();
    },
  };

  return { options, methods };
};
