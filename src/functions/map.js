import { latLng, latLngBounds } from "leaflet";
import { provide } from "vue";

export const setup = (props, mapBlueprint) => {
  const options = {
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
  };

  const methods = {
    addMapLayer(layer) {
      if (layer.layerType !== undefined) {
        if (mapBlueprint.layerControl === undefined) {
          mapBlueprint.layersToAdd.push(layer);
        } else {
          const exist = mapBlueprint.layersInControl.find(
            (l) =>
              l.leafletObject._leaflet_id === layer.leafletObject._leaflet_id
          );
          if (!exist) {
            mapBlueprint.layerControl.addLayer(layer);
            mapBlueprint.layersInControl.push(layer);
          }
        }
      }
      if (layer.visible !== false) {
        mapBlueprint.leafletRef.addLayer(layer.leafletObject);
      }
    },

    removeMapLayer(layer) {
      if (!mapBlueprint.ready) {
        return;
      }
      if (layer.layerType !== undefined) {
        if (mapBlueprint.layerControl === undefined) {
          mapBlueprint.layersToAdd = mapBlueprint.layersToAdd.filter(
            (l) => l.name !== layer.name
          );
        } else {
          mapBlueprint.layerControl.removeLayer(layer.leafletObject);
          mapBlueprint.layersInControl = mapBlueprint.layersInControl.filter(
            (l) =>
              l.leafletObject._leaflet_id !== layer.leafletObject._leaflet_id
          );
        }
      }
      mapBlueprint.leafletRef.removeLayer(layer.leafletObject);
    },

    registerLayerControl(lControlLayer) {
      if (!mapBlueprint.ready) {
        return;
      }
      mapBlueprint.layerControl = lControlLayer;
      mapBlueprint.leafletRef.addControl(lControlLayer.leafletObject);
      mapBlueprint.layersToAdd.forEach((layer) => {
        mapBlueprint.layerControl.addLayer(layer);
      });
      mapBlueprint.layersToAdd = [];
    },

    fitBounds(bounds) {
      if (!mapBlueprint.ready) {
        return;
      }
      mapBlueprint.leafletRef.fitBounds(bounds, {
        animate: this.noBlockingAnimations ? false : null,
      });
    },

    setZoom(newVal) {
      mapBlueprint.leafletRef.setZoom(newVal, {
        animate: props.noBlockingAnimations ? false : null,
      });
    },
    setPaddingBottomRight(newVal) {
      mapBlueprint.paddingBottomRight = newVal;
    },
    setPaddingTopLeft(newVal) {
      mapBlueprint.paddingTopLeft = newVal;
    },
    setPadding(newVal) {
      mapBlueprint.padding = newVal;
    },
    setCrs(newVal) {
      const prevBounds = mapBlueprint.leafletRef.getBounds();
      mapBlueprint.leafletRef.options.crs = newVal;
      mapBlueprint.leafletRef.fitBounds(prevBounds, {
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
        mapBlueprint.lastSetBounds || mapBlueprint.leafletRef.getBounds();
      const boundsChanged = !oldBounds.equals(newBounds, 0); // set maxMargin to 0 - check exact equals
      if (boundsChanged) {
        mapBlueprint.lastSetBounds = newBounds;
        mapBlueprint.leafletRef.fitBounds(newBounds, this.fitBoundsOptions);
      }
    },
    setCenter(newVal) {
      if (newVal == null) {
        return;
      }
      const newCenter = latLng(newVal);
      const oldCenter =
        mapBlueprint.lastSetCenter || mapBlueprint.leafletRef.getCenter();
      if (oldCenter.lat !== newCenter.lat || oldCenter.lng !== newCenter.lng) {
        mapBlueprint.lastSetCenter = newCenter;
        mapBlueprint.leafletRef.panTo(newCenter, {
          animate: this.noBlockingAnimations ? false : null,
        });
      }
    },
  };

  provide("addMapLayer", methods.addMapLayer);
  provide("removeMapLayer", methods.removeMapLayer);
  provide("registerLayerControl", methods.registerLayerControl);

  return { options, methods };
};

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
