import { propsToLeafletOptions } from "../utils";
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

  const options = propsToLeafletOptions(
    props,
    controlZoomProps,
    controlOptions
  );

  return { options, methods: controlMethods };
};
