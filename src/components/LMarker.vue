<script>
/* eslint-disable */
import { remapEvents, propsBinder, debounce } from "../utils.js";

import { onMounted, ref, computed, inject, watch } from "vue";
import { props as layerProps, setup as layerSetup } from "../functions/layer";

/**
 * Marker component, lets you add and personalize markers on the map
 */
export default {
  name: "LMarker",
  props: {
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
  },
  setup(props, context) {
    const mapRef = ref({});
    const ready = ref(false);
    const addLayer = inject("addLayer");
    const options = {
      ...layerSetup(props, mapRef),
      ...props,
    };

    onMounted(async () => {
      const { marker, DomEvent, latLng } = await import(
        "leaflet/dist/leaflet-src.esm"
      );

      mapRef.value = marker(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(mapRef.value, listeners);

      const methods = {
        setDraggable(value) {
          if (mapRef.value.dragging) {
            newVal
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
            const newLatLng = latlng(newVal);
            if (
              newLatLng.lat !== oldLatLng.lat ||
              newLatLng.lng !== oldLatLng.lng
            ) {
              mapRef.value.setLatLng(newLatLng);
            }
          }
        },
      };

      mapRef.value.on("move", debounce(methods.latLngSync, 100));
      propsBinder(methods, mapRef.value, props);
      addLayer(mapRef.value);
      ready.value = true;
    });

    const mapObject = computed(() => mapRef.value);
    return { mapObject, ready };
  },
  render: function (h) {
    if (this.ready && this.$slots.default) {
      return h("div", { style: { display: "none" } }, this.$slots.default);
    }
    return null;
  },
};
</script>
