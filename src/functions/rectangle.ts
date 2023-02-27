import { propsToLeafletOptions } from "../utils";
import { polygonProps, setupPolygon } from "./polygon";

polygonProps.latLngs.required = false;
export const rectangleProps = {
  ...polygonProps,
  bounds: {
    type: Array,
    custom: true,
  },
};

export const setupRectangle = (props, leafletRef, context) => {
  const { options: polygonOptions, methods: polygonMethods } = setupPolygon(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions(props, rectangleProps, polygonOptions);

  const methods = {
    ...polygonMethods,
    setBounds(latLngBounds) {
      leafletRef.value.setBounds(latLngBounds);
    },
    setLatLngs(latLngs) {
      // Calling setLatLngs on a Leaflet rectangle will convert it
      // to a polygon. So instead, we call setBounds here to ensure
      // that the rectangle remains a rectangle, defined by the
      // bounds of the points in the latLngs array.
      leafletRef.value.setBounds(latLngs);
    },
  };

  return { options, methods };
};
