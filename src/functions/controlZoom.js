import { props as controlProps, setup as controlSetup } from "./control";

export const props = {
  ...controlProps,
  zoomInText: {
    type: String,
    default: "+",
  },
  zoomInTitle: {
    type: String,
    default: "Zoom in",
  },
  zoomOutText: {
    type: String,
    default: "-",
  },
  zoomOutTitle: {
    type: String,
    default: "Zoom out",
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
