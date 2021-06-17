import { props as layerProps, setup as layerSetup } from "./layer";

export const props = {
  ...layerProps,
  pane: {
    type: String,
    default: "markerPane",
  },
  draggable: {
    type: Boolean,
    custom: true,
    default: false,
  },
  latLng: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  icon: {
    type: [Object],
    default: () => undefined,
    custom: false,
  },
  zIndexOffset: {
    type: Number,
    custom: false,
    default: null,
  },
};

export const setup = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
    props,
    leafletRef,
    context
  );
  const options = {
    ...layerOptions,
    ...props,
  };

  const methods = {
    ...layerMethods,
    setDraggable(value) {
      if (leafletRef.value.dragging) {
        value
          ? leafletRef.value.dragging.enable()
          : leafletRef.value.dragging.disable();
      }
    },
    latLngSync(event) {
      context.emit("update:latLng", event.latlng);
      context.emit("update:lat-lng", event.latlng);
    },
    setLatLng(newVal) {
      if (newVal == null) {
        return;
      }

      if (leafletRef.value) {
        const oldLatLng = leafletRef.value.getLatLng();
        if (!oldLatLng || !oldLatLng.equals(newVal)) {
          leafletRef.value.setLatLng(newVal);
        }
      }
    },
  };
  return { options, methods };
};
