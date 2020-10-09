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

export const setup = (props, leafletRef, context) => {
  const lMethods = inject("leafLetMethods");
  const options = {
    attribution: props.attribution,
    pane: props.pane,
  };

  const methods = {
    setAttribution(val, old) {
      const attributionControl = this.$parent.leafletObject.attributionControl;
      attributionControl.removeAttribution(old).addAttribution(val);
    },
    setName() {
      lMethods.removeLayer(leafletRef.value);
      if (props.visible) {
        lMethods.addLayer(leafletRef.value);
      }
    },
    setLayerType() {
      lMethods.removeLayer(leafletRef.value);
      if (props.visible) {
        lMethods.addLayer(leafletRef.value);
      }
    },
    setVisible(isVisible) {
      if (leafletRef.value) {
        if (isVisible) {
          lMethods.addLayer(leafletRef.value);
        } else {
          lMethods.removeLayer(leafletRef.value);
        }
      }
    },
    bindTooltip({ leafletObject }) {
      leafletRef.value.bindTooltip(leafletObject);
    },
    unbindTooltip() {
      const tooltip = leafletRef.value ? leafletRef.value.getTooltip() : null;
      if (tooltip) {
        tooltip.unbindTooltip();
      }
    },
    unbindPopup() {
      const popup = leafletRef.value ? leafletRef.value.getPopup() : null;
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
    ...lMethods,
    bindTooltip: methods.bindTooltip,
    unbindTooltip: methods.unbindTooltip,
  });

  onUnmounted(() => {
    methods.unbindPopup();
    methods.unbindTooltip();
    lMethods.removeLayer({ leafletObject: leafletRef.value });
  });

  return { options, methods };
};
