import type L from "leaflet";

import { propsToLeafletOptions } from "@src/utils";

import { controlProps, setupControl } from "./control";

export const controlZoomProps = {
  ...controlProps,
  zoomInText: {
    type: String,
  },
  zoomInTitle: {
    type: String,
  },
  zoomOutText: {
    type: String,
  },
  zoomOutTitle: {
    type: String,
  },
} as const;

export const setupControlZoom = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setupControl(
    props,
    leafletRef
  );

  const options = propsToLeafletOptions<L.Control.ZoomOptions>(
    props,
    controlZoomProps,
    controlOptions
  );

  return { options, methods: controlMethods };
};
