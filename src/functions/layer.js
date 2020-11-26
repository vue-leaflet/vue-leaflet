import { onUnmounted, provide, inject, h } from "vue";
import { props as componentProps, setup as componentSetup } from "./component";

export const props = {
  ...componentProps,
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
  const addLayer = inject("addLayer");
  const removeLayer = inject("removeLayer");
  const {
    options: componentOptions,
    methods: componentMethods,
  } = componentSetup(props);

  const options = {
    ...componentOptions,
    attribution: props.attribution,
    pane: props.pane,
  };

  const addThisLayer = () => addLayer({ leafletObject: leafletRef.value });
  const removeThisLayer = () =>
    removeLayer({ leafletObject: leafletRef.value });

  const methods = {
    ...componentMethods,
    setAttribution(val, old) {
      const attributionControl = this.$parent.leafletObject.attributionControl;
      attributionControl.removeAttribution(old).addAttribution(val);
    },
    setName() {
      removeThisLayer();
      if (props.visible) {
        addThisLayer();
      }
    },
    setLayerType() {
      removeThisLayer();
      if (props.visible) {
        addThisLayer();
      }
    },
    setVisible(isVisible) {
      if (leafletRef.value) {
        if (isVisible) {
          addThisLayer();
        } else {
          removeThisLayer();
        }
      }
    },
    bindPopup({ leafletObject }) {
      leafletRef.value.bindPopup(leafletObject);
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

  provide("bindPopup", methods.bindPopup);
  provide("bindTooltip", methods.bindTooltip);
  provide("unbindTooltip", methods.unbindTooltip);
  provide("unbindPopup", methods.unbindPopup);

  onUnmounted(() => {
    methods.unbindPopup();
    methods.unbindTooltip();
    removeThisLayer();
  });

  return { options, methods };
};

export const render = (ready, slots) => {
  if (ready && slots.default) {
    return h("div", { style: { display: "none" } }, slots.default());
  }
};
