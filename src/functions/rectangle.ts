import type L from "leaflet";
import type { PropType } from "vue";

import { propsToLeafletOptions } from "@src/utils";

import { polygonProps, setupPolygon } from "./polygon";

export const rectangleProps = {
  ...polygonProps,
  latLngs: {
    ...polygonProps.latLngs,
    required: false,
  },
  bounds: {
    type: Object as PropType<L.LatLngExpression[]>,
    custom: true,
  },
} as const;

export const setupRectangle = (props, leafletRef, context) => {
  const { options: polygonOptions, methods: polygonMethods } = setupPolygon(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.PolylineOptions>(
    props,
    rectangleProps,
    polygonOptions
  );

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
