import { props as gridLayerProps, setup as gridLayerSetup } from "./gridLayer";

export const props = {
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

export const setup = (props, leafletRef, context) => {
  const {
    options: gridLayerOptions,
    methods: gridLayerMethods,
  } = gridLayerSetup(props, leafletRef, context);
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
