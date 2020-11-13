import {
  props as layerGroupProps,
  setup as layerGroupSetup,
} from "./layerGroup";

export const props = {
  ...layerGroupProps,
  geojson: {
    type: [Object, Array],
    default: () => ({}),
  },
};

export const setup = (props, leafletRef) => {
  const { options: layerOptions, methods: layerGroupMethods } = layerGroupSetup(
    props,
    leafletRef
  );

  const options = {
    ...layerOptions,
    ...props,
  };

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
