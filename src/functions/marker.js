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

/**
 * Determine whether the default Leaflet icon should be replaced with a blank div initially.
 *
 * @param {*} options Options object returned by setupMarker
 * @param {*} context Context object returned by setupMarker
 * @returns boolean
 */
export const shouldBlankIcon = (options, context) => {
  // If there is content within the <LMarker>, and it contains anything other than a
  // tooltip for the marker, then the icon should be replaced with an empty div on
  // creation so that Leaflet does not render its default icon momentarily before
  // Vue mounts the inner content and vue-leaflet updates the marker with it.
  // See https://github.com/vue-leaflet/vue-leaflet/issues/170
  const slotContent = context.slots.default && context.slots.default();
  if (
    slotContent &&
    slotContent.some((el) => !["LTooltip", "LPopup"].includes(el.type.name))
  ) {
    return true;
  }

  return false;
};
