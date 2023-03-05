import type L from "leaflet";

import { propsToLeafletOptions } from "@src/utils";

import { polylineProps, setupPolyline } from "./polyline";

export const polygonProps = {
  ...polylineProps,
} as const;

export const setupPolygon = (props, leafletRef, context) => {
  const { options: polylineOptions, methods: polylineMethods } = setupPolyline(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.PolylineOptions>(
    props,
    polygonProps,
    polylineOptions
  );

  const methods = {
    ...polylineMethods,
    toGeoJSON(precision) {
      return leafletRef.value.toGeoJSON(precision);
    },
  };

  return { options, methods };
};
