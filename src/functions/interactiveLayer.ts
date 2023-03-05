import type L from "leaflet";

import { propsToLeafletOptions } from "@src/utils";

import { layerProps, setupLayer } from "./layer";

export const interactiveLayerProps = {
  ...layerProps,
  interactive: {
    type: Boolean,
    default: undefined,
  },
  bubblingMouseEvents: {
    type: Boolean,
    default: undefined,
  },
} as const;

export const setupInteractiveLayer = (props, leafletRef, context) => {
  const { options: layerOptions, methods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.InteractiveLayerOptions>(
    props,
    interactiveLayerProps,
    layerOptions
  );

  return { options, methods };
};
