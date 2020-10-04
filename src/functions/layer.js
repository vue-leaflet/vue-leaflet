import { inject, onUnmounted, provide } from "vue";

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
  const addMapLayer = inject("addMapLayer");
  const removeMapLayer = inject("removeMapLayer");
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
      removeMapLayer(mapRef.value);
      if (props.visible) {
        addMapLayer(mapRef.value);
      }
    },
    setLayerType() {
      removeMapLayer(mapRef.value);
      if (props.visible) {
        addMapLayer(mapRef.value);
      }
    },
    setVisible(isVisible) {
      if (mapRef.value) {
        if (isVisible) {
          addMapLayer(mapRef.value);
        } else {
          removeMapLayer(mapRef.value);
        }
      }
    },
    bindTooltip({ mapObject }) {
      mapRef.value.bindTooltip(mapObject);
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

  provide("leafLetMethods", {
    bindTooltip: methods.bindTooltip,
    unbindTooltip: methods.unbindTooltip,
  });

  onUnmounted(() => {
    methods.unbindPopup();
    methods.unbindTooltip();
    removeMapLayer({ mapObject: mapRef.value });
  });

  return { options, methods };
};
