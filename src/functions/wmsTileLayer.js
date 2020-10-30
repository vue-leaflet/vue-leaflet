import { props as tileLayerProps, setup as tileLayerSetup } from "./tileLayer";

export const props = {
  ...tileLayerProps,
  baseUrl: {
    type: String,
    default: null,
    required: true,
  },
  layers: {
    type: String,
    default: "",
  },
  styles: {
    type: String,
    default: "",
  },
  format: {
    type: String,
    default: "image/jpeg",
  },
  transparent: {
    type: Boolean,
    custom: false,
  },
  version: {
    type: String,
    default: "1.1.1",
  },
  crs: {
    default: null,
  },
  upperCase: {
    type: Boolean,
    default: false,
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
