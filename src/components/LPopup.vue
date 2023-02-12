<script>
import {
  onMounted,
  ref,
  inject,
  nextTick,
  onBeforeUnmount,
  markRaw,
} from "vue";
import {
  propsBinder,
  remapEvents,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import { popupProps, setupPopup } from "../functions/popup";
import { render } from "../functions/popper";

/**
 * Display a popup on the map
 */
export default {
  name: "LPopup",
  props: popupProps,
  setup(props, context) {
    const leafletObject = ref({});
    const root = ref(null);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const bindPopup = inject("bindPopup");
    const unbindPopup = inject("unbindPopup");

    const { options, methods } = setupPopup(props, leafletObject, context);

    onMounted(async () => {
      const { popup, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw(popup(options));

      if (props.latLng !== undefined) {
        leafletObject.value.setLatLng(props.latLng);
      }

      propsBinder(methods, leafletObject.value, props);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);
      leafletObject.value.setContent(props.content || root.value);
      bindPopup({ leafletObject: leafletObject.value });
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    onBeforeUnmount(() => {
      unbindPopup({ leafletObject: leafletObject.value });
    });

    return { root, leafletObject };
  },
  render() {
    return render(this.$slots);
  },
};
</script>
