import { props as polylineProps, setup as polylineSetup } from "./polyline";

export const props = {
  ...polylineProps,
};

export const setup = (props, leafletRef, context) => {
  const { options: polylineOptions, methods: polylineMethods } = polylineSetup(
    props,
    leafletRef,
    context
  );
  const options = {
    ...polylineOptions,
    ...props,
  };

  const methods = {
    ...polylineMethods,
    toGeoJSON(precision) {
      return leafletRef.value.toGeoJSON(precision);
    },
  };

  return { options, methods };
};
