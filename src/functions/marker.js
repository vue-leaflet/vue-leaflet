import { inject } from "vue";
import { props as layerProps, setup as layerSetup } from "../functions/layer";

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
  const latLng = inject("latLng");

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
        const newLatLng = latLng(newVal);
        if (
          newLatLng.lat !== oldLatLng.lat ||
          newLatLng.lng !== oldLatLng.lng
        ) {
          leafletRef.value.setLatLng(newLatLng);
        }
      }
    },
  };
  return { options, methods };
};
