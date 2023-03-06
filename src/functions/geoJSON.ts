import type { GeoJsonObject } from "geojson";
import type L from "leaflet";
import type { PropType } from "vue";

import { propsToLeafletOptions } from "@src/utils";

import { layerGroupProps, setupLayerGroup } from "./layerGroup";

export const geoJSONProps = {
  ...layerGroupProps,
  geojson: {
    type: [Object, Array] as PropType<GeoJsonObject | GeoJsonObject[]>,
    custom: true,
  },
  optionsStyle: {
    type: Function as PropType<L.StyleFunction>,
    custom: true,
  },
} as const;

export const setupGeoJSON = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerGroupMethods } = setupLayerGroup(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.GeoJSONOptions>(
    props,
    geoJSONProps,
    layerOptions
  );
  if (Object.prototype.hasOwnProperty.call(props, "optionsStyle")) {
    options.style = props.optionsStyle;
  }

  const methods = {
    ...layerGroupMethods,
    setGeojson(newVal) {
      leafletRef.value.clearLayers();
      leafletRef.value.addData(newVal);
    },
    setOptionsStyle(newVal) {
      leafletRef.value.setStyle(newVal);
    },
    getGeoJSONData() {
      return leafletRef.value.toGeoJSON();
    },
    getBounds() {
      return leafletRef.value.getBounds();
    },
  };

  return { options, methods };
};
