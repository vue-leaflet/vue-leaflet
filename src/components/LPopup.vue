<script lang="ts">
import type L from "leaflet";
import {
  defineComponent,
  inject,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

import { render } from "@src/functions/popper";
import { popupProps, setupPopup } from "@src/functions/popup";
import {
  BindPopupInjection,
  UnbindPopupInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import {
  WINDOW_OR_GLOBAL,
  assertInject,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

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
      const { popup }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Popup>(popup(options));

      if (props.latLng !== undefined) {
        leafletObject.value.setLatLng(props.latLng);
      }

      propsBinder(methods, leafletObject.value, props);
      const listeners = remapEvents(context.attrs);
      leafletObject.value.on(listeners);
      leafletObject.value.setContent(props.content || root.value || "");
      bindPopup(leafletObject.value);
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    onBeforeUnmount(() => {
      unbindPopup();
    });

    return { root, leafletObject };
  },
  render() {
    return render(this.$slots);
  },
});
</script>
