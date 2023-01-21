import { controlProps, setupControl } from "./control";

export const controlZoomProps = {
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

export const setupControlZoom = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setupControl(
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
