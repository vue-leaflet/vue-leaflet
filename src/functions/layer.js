import { inject, onUnmounted } from "vue";

export const props = {
  pane: {
    type: String,
    default: "overlayPane",
  },
  attribution: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    custom: true,
    default: undefined,
  },
  layerType: {
    type: String,
    custom: true,
    default: undefined,
  },
  visible: {
    type: Boolean,
    custom: true,
    default: true,
  },
};

export const setup = (props, mapRef, context) => {
  const lMethods = inject("leafLetMethods");

  const unbindTooltip = () => {
    const tooltip = mapRef.value ? mapRef.value.getTooltip() : null;
    if (tooltip) {
      tooltip.unbindTooltip();
    }
  };

  const unbindPopup = () => {
    const popup = mapRef.value ? mapRef.value.getPopup() : null;
    if (popup) {
      popup.unbindPopup();
    }
  };

  const options = {
    attribution: props.attribution,
    pane: props.pane,
  };

  const methods = {
    setAttribution(val, old) {
      const attributionControl = this.$parent.mapObject.attributionControl;
      attributionControl.removeAttribution(old).addAttribution(val);
    },
    setName() {
      lMethods.removeLayer(mapRef.value);
      if (props.visible) {
        lMethods.addLayer(mapRef.value);
      }
    },
    setLayerType() {
      lMethods.removeLayer(mapRef.value);
      if (props.visible) {
        lMethods.addLayer(mapRef.value);
      }
    },
    setVisible(isVisible) {
      if (mapRef.value) {
        if (isVisible) {
          lMethods.addLayer(mapRef.value);
        } else {
          lMethods.removeLayer(mapRef.value);
        }
      }
    },

    unbindTooltip() {
      const tooltip = mapRef.value ? mapRef.value.getTooltip() : null;
      if (tooltip) {
        tooltip.unbindTooltip();
      }
    },
    unbindPopup() {
      const popup = mapRef.value ? mapRef.value.getPopup() : null;
      if (popup) {
        popup.unbindPopup();
      }
    },
    updateVisibleProp(value) {
      /**
       * Triggers when the visible prop needs to be updated
       * @type {boolean}
       * @property {boolean} value - value of the visible property
       */
      context.emit("update:visible", value);
    },
  };

  onUnmounted(() => {
    unbindPopup();
    unbindTooltip();
    lMethods.removeLayer({ mapObject: mapRef.value });
  });

  return { options, methods };
};
