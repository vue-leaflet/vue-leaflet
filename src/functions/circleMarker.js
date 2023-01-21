import { props as pathProps, setup as pathSetup } from "./path";

export const props = {
  ...pathProps,
  /**
   * Radius of the marker in pixels.
   */
  radius: {
    type: Number,
  },
  latLng: {
    type: [Object, Array],
    required: true,
    custom: true,
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
