import { props as pathProps, setup as pathSetup } from "./path";

export const props = {
  ...pathProps,
  latLngs: {
    type: Array,
    required: true,
    custom: true,
  },
  smoothFactor: {
    type: Number,
  },
  noClip: {
    type: Boolean,
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
