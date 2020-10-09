import { props as gridLayerProps, setup as gridLayerSetup } from "./gridLayer";

export const props = {
  ...gridLayerProps,
  tms: {
    type: Boolean,
    default: false,
  },
  subdomains: {
    type: String,
    default: "abc",
  },
  detectRetina: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    default: null,
  },
};

export const setup = (props, leafletRef) => {
  const {
    options: gridLayerOptions,
    methods: gridLayerMethods,
  } = gridLayerSetup(props, leafletRef);
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
