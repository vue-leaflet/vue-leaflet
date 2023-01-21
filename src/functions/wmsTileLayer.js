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
  },
  version: {
    type: String,
  },
  crs: {
    type: Object,
  },
  upperCase: {
    type: Boolean,
  },
  baseUrl: {
    type: String,
    required: true,
    custom: true,
  },
};

export const setupWMSTileLayer = (props, leafletRef) => {
  const {
    options: tileLayerOptions,
    methods: tileLayerMethods,
  } = setupTileLayer(props, leafletRef);
  const options = {
    ...tileLayerOptions,
    layers: props.layers,
    styles: props.styles,
    format: props.format,
    transparent: props.transparent,
    version: props.version,
    crs: props.crs,
    upperCase: props.upperCase,
  };
  return {
    options,
    methods: {
      ...tileLayerMethods,
    },
  };
};
