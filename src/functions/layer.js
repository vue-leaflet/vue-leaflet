import { onUnmounted, provide, inject, h } from "vue";
import { componentProps, setupComponent } from "./component";
import { isFunction, propsToLeafletOptions } from "../utils";

export const layerProps = {
  ...componentProps,
  pane: {
    type: String,
  },
  attribution: {
    type: String,
  },
  name: {
    type: String,
    custom: true,
  },
  layerType: {
    type: String,
    custom: true,
  },
  visible: {
    type: Boolean,
    custom: true,
    default: true,
  },
};

export const setupLayer = (props, leafletRef, context) => {
  const addLayer = inject("addLayer");
  const removeLayer = inject("removeLayer");
  const {
    options: componentOptions,
    methods: componentMethods,
  } = setupComponent(props);

  const options = propsToLeafletOptions(props, layerProps, componentOptions);

  const addThisLayer = () => addLayer({ leafletObject: leafletRef.value });
  const removeThisLayer = () =>
    removeLayer({ leafletObject: leafletRef.value });

  const methods = {
    ...componentMethods,
    setAttribution(val) {
      removeThisLayer();
      leafletRef.value.options.attribution = val;
      if (props.visible) {
        addThisLayer();
      }
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
      if (!leafletRef.value || !isFunction(leafletRef.value.bindPopup)) {
        console.warn(
          "Attempt to bind popup before bindPopup method available on layer."
        );

        return;
      }

      leafletRef.value.bindPopup(leafletObject);
    },
    bindTooltip({ leafletObject }) {
      if (!leafletRef.value || !isFunction(leafletRef.value.bindTooltip)) {
        console.warn(
          "Attempt to bind tooltip before bindTooltip method available on layer."
        );

        return;
      }

      leafletRef.value.bindTooltip(leafletObject);
    },
    unbindTooltip() {
      if (leafletRef.value) {
        if (isFunction(leafletRef.value.closeTooltip)) {
          leafletRef.value.closeTooltip();
        }
        if (isFunction(leafletRef.value.unbindTooltip)) {
          leafletRef.value.unbindTooltip();
        }
      }
    },
    unbindPopup() {
      if (leafletRef.value) {
        if (isFunction(leafletRef.value.closePopup)) {
          leafletRef.value.closePopup();
        }
        if (isFunction(leafletRef.value.unbindPopup)) {
          leafletRef.value.unbindPopup();
        }
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
