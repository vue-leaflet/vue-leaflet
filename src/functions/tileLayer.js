import { props as gridLayerProps, setup as gridLayerSetup } from "./gridLayer";

export const props = {
  ...gridLayerProps,
  tms: {
    type: Boolean,
    default: false,
  },
  subdomains: {
    type: [String, Array],
    default: "abc",
    validator: prop => {
      if (typeof prop === 'string') return true;
      if (Array.isArray(prop)) {
        return prop.every(subdomain => typeof subdomain === 'string');
      }
      return false;
    }
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
