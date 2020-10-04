import { latLng, latLngBounds } from "leaflet";

export const mapMethodBuilders = {
  buildAddMapLayer(blueprint) {
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
  },

  buildRemoveMapLayer(blueprint) {
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
  },

  buildRegisterLayerControl(blueprint) {
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
  },

  buildFitBounds(blueprint) {
    return (bounds) => {
      if (!blueprint.ready) {
        return;
      }
      blueprint.mapRef.fitBounds(bounds, {
        animate: this.noBlockingAnimations ? false : null,
      });
    };
  },
};

export const buildMapPropSetters = (blueprint, props) => {
  return {
    setZoom(newVal) {
      blueprint.mapRef.setZoom(newVal, {
        animate: props.noBlockingAnimations ? false : null,
      });
    },
    setPaddingBottomRight(newVal) {
      blueprint.paddingBottomRight = newVal;
    },
    setPaddingTopLeft(newVal) {
      blueprint.paddingTopLeft = newVal;
    },
    setPadding(newVal) {
      blueprint.padding = newVal;
    },
    setCrs(newVal) {
      const prevBounds = blueprint.mapRef.getBounds();
      blueprint.mapRef.options.crs = newVal;
      blueprint.mapRef.fitBounds(prevBounds, {
        animate: false,
        padding: [0, 0],
      });
    },
    setBounds(newVal) {
      if (!newVal) {
        return;
      }
      const newBounds = latLngBounds(newVal);
      if (!newBounds.isValid()) {
        return;
      }
      const oldBounds = blueprint.lastSetBounds || blueprint.mapRef.getBounds();
      const boundsChanged = !oldBounds.equals(newBounds, 0); // set maxMargin to 0 - check exact equals
      if (boundsChanged) {
        blueprint.lastSetBounds = newBounds;
        blueprint.mapRef.fitBounds(newBounds, this.fitBoundsOptions);
      }
    },
    setCenter(newVal) {
      if (newVal == null) {
        return;
      }
      const newCenter = latLng(newVal);
      const oldCenter = blueprint.lastSetCenter || blueprint.mapRef.getCenter();
      if (oldCenter.lat !== newCenter.lat || oldCenter.lng !== newCenter.lng) {
        blueprint.lastSetCenter = newCenter;
        blueprint.mapRef.panTo(newCenter, {
          animate: this.noBlockingAnimations ? false : null,
        });
      }
    },
  };
};
