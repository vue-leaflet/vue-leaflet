import { props as pathProps, setup as pathSetup } from "./path";

export const props = {
  ...pathProps,
  latLngs: {
    type: Array,
    default: () => [],
  },
  smoothFactor: {
    type: Number,
    custom: true,
    default: 1.0,
  },
  noClip: {
    type: Boolean,
    custom: true,
    default: false,
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
