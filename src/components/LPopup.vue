<script lang="ts">
import type L from "leaflet";
import {
  onMounted,
  ref,
  inject,
  nextTick,
  onBeforeUnmount,
  markRaw,
  defineComponent,
} from "vue";
import {
  assertInject,
  propsBinder,
  remapEvents,
  WINDOW_OR_GLOBAL,
} from "@src/utils.js";
import { popupProps, setupPopup } from "@src/functions/popup";
import { render } from "@src/functions/popper";
import {
  BindPopupInjection,
  UnbindPopupInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

/**
 * Display a popup on the map
 */
export default defineComponent({
  name: "LPopup",
  props: popupProps,
  setup(props, context) {
    const leafletObject = ref<L.Popup>();
    const root = ref(null);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const bindPopup = assertInject(BindPopupInjection);
    const unbindPopup = assertInject(UnbindPopupInjection);

    const { options, methods } = setupPopup(props, leafletObject);

    onMounted(async () => {
      const { popup, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Popup>(popup(options));

      if (props.latLng !== undefined) {
        leafletObject.value.setLatLng(props.latLng);
      }

      propsBinder(methods, leafletObject.value, props);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);
      leafletObject.value.setContent(props.content || root.value);
      bindPopup(leafletObject.value);
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    onBeforeUnmount(() => {
      unbindPopup(leafletObject.value);
    });

    return { root, leafletObject };
  },
  render() {
    return render(this.$slots);
  },
});
</script>
