import { props as polygonProps, setup as polygonSetup } from "./polygon";

export const props = {
  ...polygonProps,
  bounds: {
    type: Array,
    default: undefined,
  },
};

export const setup = (props, leafletRef, context) => {
  const { options: polygonOptions, methods: polygonMethods } = polygonSetup(
    props,
    leafletRef,
    context
  );
  const options = {
    ...polygonOptions,
    ...props,
  };

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
