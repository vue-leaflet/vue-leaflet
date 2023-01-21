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
  const options = {
    ...gridLayerOptions,
    tms: props.tms,
    subdomains: props.subdomains,
    detectRetina: props.detectRetina,
  };
  return {
    options,
    methods: {
      ...gridLayerMethods,
    },
  };
};
