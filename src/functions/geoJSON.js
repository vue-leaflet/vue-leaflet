import { propsToLeafletOptions } from "../utils";
import { layerGroupProps, setupLayerGroup } from "./layerGroup";

export const geoJSONProps = {
  ...layerGroupProps,
  geojson: {
    type: [Object, Array],
    custom: true,
  },
};

export const setupGeoJSON = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerGroupMethods } = setupLayerGroup(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions(props, geoJSONProps, layerOptions);

  const methods = {
    ...layerGroupMethods,
    setGeojson(newVal) {
      leafletRef.value.clearLayers();
      leafletRef.value.addData(newVal);
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
