import { propsToLeafletOptions } from "../utils";
import { pathProps as pathProps, setupPath as pathSetup } from "./path";

export const circleMarkerProps = {
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

export const setupCircleMarker = (props, leafletRef, context) => {
  const { options: pathOptions, methods: pathMethods } = pathSetup(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions(props, circleMarkerProps, pathOptions);

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
