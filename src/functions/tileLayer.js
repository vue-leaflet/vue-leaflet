import { propsToLeafletOptions } from "../utils";
import { gridLayerProps, setupGridLayer } from "./gridLayer";

export const tileLayerProps = {
  ...gridLayerProps,
  tms: {
    type: Boolean,
    default: undefined,
  },
  subdomains: {
    type: [String, Array],
    validator: (prop) => {
      if (typeof prop === "string") return true;
      if (Array.isArray(prop)) {
        return prop.every((subdomain) => typeof subdomain === "string");
      }
      return false;
    },
  },
  detectRetina: {
    type: Boolean,
    default: undefined,
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
