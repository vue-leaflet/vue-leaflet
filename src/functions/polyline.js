import { propsToLeafletOptions } from "../utils";
import { pathProps, setupPath } from "./path";

export const polylineProps = {
  ...pathProps,
  smoothFactor: {
    type: Number,
  },
  noClip: {
    type: Boolean,
    default: undefined,
  },
  latLngs: {
    type: Array,
    required: true,
    custom: true,
  },
};

export const setupPolyline = (props, leafletRef, context) => {
  const { options: pathOptions, methods: pathMethods } = setupPath(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions(props, polylineProps, pathOptions);

  const methods = {
    ...pathMethods,
    setSmoothFactor(smoothFactor) {
      leafletRef.value.setStyle({ smoothFactor });
    },
    setNoClip(noClip) {
      leafletRef.value.setStyle({ noClip });
    },
    addLatLng(latLng) {
      leafletRef.value.addLatLng(latLng);
    },
  };

  return { options, methods };
};
