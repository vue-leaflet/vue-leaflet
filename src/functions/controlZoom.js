import { props as controlProps, setup as controlSetup } from "./control";

export const props = {
  ...controlProps,
  zoomInText: {
    type: String,
  },
  zoomInTitle: {
    type: String,
  },
  zoomOutText: {
    type: String,
  },
  zoomOutTitle: {
    type: String,
  },
};

export const setup = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = controlSetup(
    props,
    leafletRef
  );
  const options = {
    ...controlOptions,
    zoomInText: props.zoomInText,
    zoomInTitle: props.zoomInTitle,
    zoomOutText: props.zoomOutText,
    zoomOutTitle: props.zoomOutTitle,
  };

  return { options, methods: controlMethods };
};
