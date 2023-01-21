import { props as tileLayerProps, setup as tileLayerSetup } from "./tileLayer";

export const props = {
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

export const setup = (props, leafletRef) => {
  const {
    options: tileLayerOptions,
    methods: tileLayerMethods,
  } = tileLayerSetup(props, leafletRef);
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
