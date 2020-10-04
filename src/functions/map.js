export const buildAddMapLayer = (blueprint) => {
  return (layer) => {
    if (!blueprint.ready) {
      return;
    }
    if (layer.layerType !== undefined) {
      if (blueprint.layerControl === undefined) {
        blueprint.layersToAdd.push(layer);
      } else {
        const exist = blueprint.layersInControl.find(
          (l) => l.mapObject._leaflet_id === layer.mapObject._leaflet_id
        );
        if (!exist) {
          blueprint.layerControl.addLayer(layer);
          blueprint.layersInControl.push(layer);
        }
      }
    }
    if (layer.visible !== false) {
      blueprint.mapRef.addLayer(layer.mapObject);
    }
  };
};

export const buildRemoveMapLayer = (blueprint) => {
  return (layer) => {
    if (!blueprint.ready) {
      return;
    }
    if (layer.layerType !== undefined) {
      if (blueprint.layerControl === undefined) {
        blueprint.layersToAdd = blueprint.layersToAdd.filter(
          (l) => l.name !== layer.name
        );
      } else {
        blueprint.layerControl.removeLayer(layer.mapObject);
        blueprint.layersInControl = blueprint.layersInControl.filter(
          (l) => l.mapObject._leaflet_id !== layer.mapObject._leaflet_id
        );
      }
    }
    blueprint.mapRef.removeLayer(layer.mapObject);
  };
};

export const buildRegisterLayerControl = (blueprint) => {
  return (lControlLayer) => {
    if (!blueprint.ready) {
      return;
    }
    blueprint.layerControl = lControlLayer;
    blueprint.mapRef.addControl(lControlLayer.mapObject);
    blueprint.layersToAdd.forEach((layer) => {
      blueprint.layerControl.addLayer(layer);
    });
    blueprint.layersToAdd = [];
  };
};
