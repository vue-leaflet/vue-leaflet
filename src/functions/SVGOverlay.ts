import type L from "leaflet";
import type { PropType } from "vue";

import { propsToLeafletOptions } from "@src/utils";

import { imageOverlayProps, setupImageOverlay } from "./imageOverlay";

export const SVGOverlayProps = {
  ...imageOverlayProps,
  url: {
    type: [SVGElement, String] as PropType<SVGElement | string>,
    required: true,
    custom: true,
  },
} as const;

export const setupSVGOverlay = (props, leafletRef, context) => {
  const { options: imageOverlayOptions, methods: imageOverlayMethods } =
    setupImageOverlay(props, leafletRef, context);

  const options = propsToLeafletOptions<L.ImageOverlayOptions>(
    props,
    SVGOverlayProps,
    imageOverlayOptions
  );

  const methods = {
    ...imageOverlayMethods,
    /**
     * Returns the instance of SVGElement used by this overlay.
     * @returns {SVGElement}
     */
    getElement() {
      return leafletRef.value.getElement();
    },
  };

  return { options, methods };
};
