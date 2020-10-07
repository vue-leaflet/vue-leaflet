import { latLng, latLngBounds } from "leaflet";

export const getDefaultMapOptions = (props) => ({
  minZoom: props.minZoom,
  maxZoom: props.maxZoom,
  maxBounds: props.maxBounds,
  maxBoundsViscosity: props.maxBoundsViscosity,
  worldCopyJump: props.worldCopyJump,
  crs: props.crs,
  center: props.center,
  zoom: props.zoom,
  inertia: props.inertia,
  inertiaDeceleration: props.inertiaDeceleration,
  inertiaMaxSpeed: props.inertiaMaxSpeed,
  easeLinearity: props.easeLinearity,
  zoomAnimation: props.zoomAnimation,
  zoomAnimationThreshold: props.zoomAnimationThreshold,
  fadeAnimation: props.fadeAnimation,
  markerZoomAnimation: props.markerZoomAnimation,
});

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
        blueprint.leafletRef.addLayer(layer.mapObject);
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
      blueprint.leafletRef.removeLayer(layer.mapObject);
    };
  },

  buildRegisterLayerControl(blueprint) {
    return (lControlLayer) => {
      if (!blueprint.ready) {
        return;
      }
      blueprint.layerControl = lControlLayer;
      blueprint.leafletRef.addControl(lControlLayer.mapObject);
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
      blueprint.leafletRef.fitBounds(bounds, {
        animate: this.noBlockingAnimations ? false : null,
      });
    };
  },
};

export const buildMapPropSetters = (blueprint, props) => ({
  setZoom(newVal) {
    blueprint.leafletRef.setZoom(newVal, {
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
    const prevBounds = blueprint.leafletRef.getBounds();
    blueprint.leafletRef.options.crs = newVal;
    blueprint.leafletRef.fitBounds(prevBounds, {
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
    const oldBounds =
      blueprint.lastSetBounds || blueprint.leafletRef.getBounds();
    const boundsChanged = !oldBounds.equals(newBounds, 0); // set maxMargin to 0 - check exact equals
    if (boundsChanged) {
      blueprint.lastSetBounds = newBounds;
      blueprint.leafletRef.fitBounds(newBounds, this.fitBoundsOptions);
    }
  },
  setCenter(newVal) {
    if (newVal == null) {
      return;
    }
    const newCenter = latLng(newVal);
    const oldCenter =
      blueprint.lastSetCenter || blueprint.leafletRef.getCenter();
    if (oldCenter.lat !== newCenter.lat || oldCenter.lng !== newCenter.lng) {
      blueprint.lastSetCenter = newCenter;
      blueprint.leafletRef.panTo(newCenter, {
        animate: this.noBlockingAnimations ? false : null,
      });
    }
  },
});

export const buildMapEventHandlers = (blueprint, context) => ({
  moveEndHandler() {
    /**
     * Triggers when zoom is updated
     * @type {number,string}
     */
    context.emit("update:zoom", blueprint.leafletRef.getZoom());
    /**
     * Triggers when center is updated
     * @type {object,array}
     */
    context.emit("update:center", blueprint.leafletRef.getCenter());

    /**
     * Triggers when bounds are updated
     * @type {object}
     */
    context.emit("update:bounds", blueprint.leafletRef.getBounds());
  },
  overlayAddHandler(e) {
    const layer = blueprint.layersInControl.find((l) => l.name === e.name);
    if (layer) {
      layer.updateVisibleProp(true);
    }
  },
  overlayRemoveHandler(e) {
    const layer = blueprint.layersInControl.find((l) => l.name === e.name);
    if (layer) {
      layer.updateVisibleProp(false);
    }
  },
});
