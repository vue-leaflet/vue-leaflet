import { propsToLeafletOptions } from "../utils";
import { layerProps, setupLayer } from "./layer";

export const markerProps = {
  ...layerProps,
  draggable: {
    type: Boolean,
    default: undefined,
  },
  icon: {
    type: [Object],
  },
  zIndexOffset: {
    type: Number,
  },
  latLng: {
    type: [Object, Array],
    custom: true,
    required: true,
  },
};

export const setupMarker = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions(props, markerProps, layerOptions);

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
