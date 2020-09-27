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

export const setup = (props, mapRef, context, leafletMethods) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
    props,
    mapRef,
    context
  );
  const options = {
    ...layerOptions,
    ...props,
  };

  const methods = {
    ...layerMethods,
    setDraggable(value) {
      if (mapRef.value.dragging) {
        value
          ? mapRef.value.dragging.enable()
          : mapRef.value.dragging.disable();
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

      if (mapRef.value) {
        const oldLatLng = mapRef.value.getLatLng();
        const newLatLng = leafletMethods.latLng(newVal);
        if (
          newLatLng.lat !== oldLatLng.lat ||
          newLatLng.lng !== oldLatLng.lng
        ) {
          mapRef.value.setLatLng(newLatLng);
        }
      }
    },
  };
  return { options, methods };
};
