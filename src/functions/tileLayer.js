import { propsToLeafletOptions } from "../utils";
import { gridLayerProps, setupGridLayer } from "./gridLayer";

export const tileLayerProps = {
  ...gridLayerProps,
  tms: {
    type: Boolean,
  },
  subdomains: {
    type: String,
  },
  detectRetina: {
    type: Boolean,
  },
  url: {
    type: String,
    required: true,
    custom: true,
  },
};

export const setupTileLayer = (props, leafletRef, context) => {
  const {
    options: gridLayerOptions,
    methods: gridLayerMethods,
  } = setupGridLayer(props, leafletRef, context);

  const options = propsToLeafletOptions(
    props,
    tileLayerProps,
    gridLayerOptions
  );

  const methods = {
    ...gridLayerMethods,
  };

  return { options, methods };
};
