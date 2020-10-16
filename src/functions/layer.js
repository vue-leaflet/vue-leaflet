import { onUnmounted, provide } from "vue";
import { injectLeafletMethod } from "../utils";

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
  console.log("injecting addLayer to layer");
  const addLayer = injectLeafletMethod("addLayer");
  const removeLayer = injectLeafletMethod("removeLayer");
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
      removeLayer(leafletRef.value);
      if (props.visible) {
        addLayer(leafletRef.value);
      }
    },
    setLayerType() {
      removeLayer(leafletRef.value);
      if (props.visible) {
        addLayer(leafletRef.value);
      }
    },
    setVisible(isVisible) {
      if (leafletRef.value) {
        if (isVisible) {
          addLayer(leafletRef.value);
        } else {
          removeLayer(leafletRef.value);
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

  provide("bindTooltip", methods.bindTooltip);
  provide("unbindTooltip", methods.unbindTooltip);

  onUnmounted(() => {
    methods.unbindPopup();
    methods.unbindTooltip();
    removeLayer({ leafletObject: leafletRef.value });
  });

  return { options, methods };
};
