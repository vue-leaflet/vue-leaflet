import { props as controlProps, setup as controlSetup } from "./control";

export const props = {
  ...controlProps,
  collapsed: {
    type: Boolean,
  },
  autoZIndex: {
    type: Boolean,
  },
  hideSingleBase: {
    type: Boolean,
  },
  sortLayers: {
    type: Boolean,
  },
  sortFunction: {
    type: Function,
  },
};

export const setup = (props, leafletRef) => {
  const { options: controlOptions } = controlSetup(props, leafletRef);
  const options = {
    ...controlOptions,
    collapsed: props.collapsed,
    autoZIndex: props.autoZIndex,
    hideSingleBase: props.hideSingleBase,
    sortLayers: props.sortLayers,
    sortFunction: props.sortFunction,
  };

  const methods = {
    addLayer(layer) {
      if (layer.layerType === "base") {
        leafletRef.value.addBaseLayer(layer.leafletObject, layer.name);
      } else if (layer.layerType === "overlay") {
        leafletRef.value.addOverlay(layer.leafletObject, layer.name);
      }
    },
    removeLayer(layer) {
      leafletRef.value.removeLayer(layer.leafletObject);
    },
  };
  return { options, methods };
};
