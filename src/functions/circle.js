import { circleMarkerProps, setupCircleMarker } from "./circleMarker";

export const circleProps = {
  ...circleMarkerProps,
  /**
   * Radius of the circle in meters.
   */
  radius: {
    type: Number,
  },
};

export const setupCircle = (props, leafletRef, context) => {
  const {
    options: circleMarkerOptions,
    methods: circleMarkerMethods,
  } = setupCircleMarker(props, leafletRef, context);

  const options = {
    ...circleMarkerOptions,
    ...props,
  };

  const methods = {
    ...circleMarkerMethods,
  };

  return { options, methods };
};
