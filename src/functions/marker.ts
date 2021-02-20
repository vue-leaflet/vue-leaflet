import { LatLngExpression } from "leaflet";
import { PropType } from "vue";
import { props as layerProps, setup as layerSetup } from "./layer";

export const props = {
  ...layerProps,
  pane: {
    type: String,
    default: "markerPane",
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  latLng: {
    type: [Object, Array] as PropType<LatLngExpression>,
    required: true,
  },
  icon: {
    type: [Object],
  },
  zIndexOffset: {
    type: Number,
    default: null,
  },
};

export const setup = (setupProps, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
    setupProps,
    leafletRef,
    context
  );
  const options = {
    ...layerOptions,
    ...setupProps,
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
