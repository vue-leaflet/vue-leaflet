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
    const leafletRef = ref({});
    const root = ref(null);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const bindPopup = inject("bindPopup");
    const unbindPopup = inject("unbindPopup");

    const { options, methods } = setupPopup(props, leafletRef, context);

    onMounted(async () => {
      const { popup, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletRef.value = markRaw(popup(options));

      if (props.latLng !== undefined) {
        leafletRef.value.setLatLng(props.latLng);
      }

      propsBinder(methods, leafletRef.value, props);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      leafletRef.value.setContent(props.content || root.value);
      bindPopup({ leafletObject: leafletRef.value });
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    onBeforeUnmount(() => {
      unbindPopup({ leafletObject: leafletRef.value });
    });

    return { root, leafletObject: leafletRef };
  },
  render() {
    return render(this.$slots);
  },
};
</script>
