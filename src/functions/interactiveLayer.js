import { propsToLeafletOptions } from "../utils";
import { layerProps, setupLayer } from "./layer";

export const interactiveLayerProps = {
  ...layerProps,
  interactive: {
    type: Boolean,
  },
  bubblingMouseEvents: {
    type: Boolean,
  },
};

export const setupInteractiveLayer = (props, leafletRef, context) => {
  const { options: layerOptions, methods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions(
    props,
    interactiveLayerProps,
    layerOptions
  );

  return { options, methods };
};
