import { polylineProps, setupPolyline } from "./polyline";

export const polygonProps = {
  ...polylineProps,
};

export const setupPolygon = (props, leafletRef, context) => {
  const { options: polylineOptions, methods: polylineMethods } = setupPolyline(
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
