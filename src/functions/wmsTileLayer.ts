import type L from "leaflet";

import { propsToLeafletOptions } from "@src/utils";

import { setupTileLayer, tileLayerProps } from "./tileLayer";

export const wmsTileLayerProps = {
  ...tileLayerProps,
  layers: {
    type: String,
    required: true,
  },
  styles: {
    type: String,
  },
  format: {
    type: String,
  },
  transparent: {
    type: Boolean,
    default: undefined,
  },
  version: {
    type: String,
  },
  crs: {
    type: Object,
  },
  uppercase: {
    type: Boolean,
    default: undefined,
  },
} as const;

export const setupWMSTileLayer = (props, leafletRef, context) => {
  const { options: tileLayerOptions, methods: tileLayerMethods } =
    setupTileLayer(props, leafletRef, context);

  const options = propsToLeafletOptions<L.WMSOptions>(
    props,
    wmsTileLayerProps,
    tileLayerOptions
  );

  return {
    options,
    methods: {
      ...tileLayerMethods,
    },
  };
};
