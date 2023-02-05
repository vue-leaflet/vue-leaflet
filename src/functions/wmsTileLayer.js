import { propsToLeafletOptions } from "../utils";
import { tileLayerProps, setupTileLayer } from "./tileLayer";

export const wmsTileLayerProps = {
  ...tileLayerProps,
  layers: {
    type: String,
    required: true,
  },
  styles: {
    type: String,
  },
  format: {
    type: String,
  },
  transparent: {
    type: Boolean,
    default: undefined,
  },
  version: {
    type: String,
  },
  crs: {
    type: Object,
  },
  uppercase: {
    type: Boolean,
    default: undefined,
  },
};

export const setupWMSTileLayer = (props, leafletRef) => {
  const {
    options: tileLayerOptions,
    methods: tileLayerMethods,
  } = setupTileLayer(props, leafletRef);

  const options = propsToLeafletOptions(
    props,
    wmsTileLayerProps,
    tileLayerOptions
  );

  return {
    options,
    methods: {
      ...tileLayerMethods,
    },
  };
};
