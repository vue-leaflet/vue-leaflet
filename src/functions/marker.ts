import type L from "leaflet";
import type { PropType } from "vue";

import { propsToLeafletOptions } from "@src/utils";

import { layerProps, setupLayer } from "./layer";

const unrenderedContentTypes = ["Symbol(Comment)", "Symbol(Text)"];
const unrenderedComponentNames = ["LTooltip", "LPopup"];

export const markerProps = {
  ...layerProps,
  draggable: {
    type: Boolean,
    default: undefined,
  },
  icon: {
    type: [Object] as PropType<L.Icon | L.DivIcon>,
  },
  zIndexOffset: {
    type: Number,
  },
  latLng: {
    type: [Object, Array] as PropType<L.LatLngExpression>,
    custom: true,
    required: true,
  },
} as const;

export const setupMarker = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.MarkerOptions>(
    props,
    markerProps,
    layerOptions
  );

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

  return (
    slotContent && slotContent.length && slotContent.some(contentIsRendered)
  );
};

function contentIsRendered(el) {
  if (unrenderedContentTypes.includes(el.type.toString())) return false;
  if (unrenderedComponentNames.includes(el.type.name)) return false;

  return true;
}
