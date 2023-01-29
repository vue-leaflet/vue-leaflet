import { propsToLeafletOptions } from "../utils";
import { layerProps, setupLayer } from "./layer";

export const gridLayerProps = {
  ...layerProps,
  opacity: {
    type: Number,
  },
  zIndex: {
    type: Number,
  },
  tileSize: {
    type: Number,
  },
  noWrap: {
    type: Boolean,
    default: undefined,
  },
  minZoom: {
    type: Number,
  },
  maxZoom: {
    type: Number,
  },
};

export const setupGridLayer = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions(props, gridLayerProps, layerOptions);

  return { options, methods: { ...layerMethods } };
};
