import { props as pathProps, setup as pathSetup } from "./path";

export const props = {
  ...pathProps,
  latLng: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  /**
   * Radius of the marker in pixels.
   */
  radius: {
    type: Number,
    default: null,
  },
};

export const setup = (props, leafletRef, context) => {
  const { options: pathOptions, methods: pathMethods } = pathSetup(
    props,
    leafletRef,
    context
  );
  const options = {
    ...pathOptions,
    ...props,
  };
  const methods = {
    ...pathMethods,
    setRadius(radius) {
      leafletRef.value.setRadius(radius);
    },
    setLatLng(latLng) {
      leafletRef.value.setLatLng(latLng);
    },
  };

  return { options, methods };
};
