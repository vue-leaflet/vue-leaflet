<script lang="ts">
import type L from "leaflet";
import {
  defineComponent,
  inject,
  markRaw,
  nextTick,
  onMounted,
  ref,
} from "vue";

import { render } from "@src/functions/popper";
import { setupTooltip, tooltipProps } from "@src/functions/tooltip";
import {
  BindTooltipInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import {
  WINDOW_OR_GLOBAL,
  assertInject,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

/**
 * Display a tooltip on the map
 */
export default defineComponent({
  name: "LTooltip",
  props: tooltipProps,
  setup(props, context) {
    const leafletObject = ref<L.Tooltip>();
    const root = ref(null);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const bindTooltip = assertInject(BindTooltipInjection);

    const { options, methods } = setupTooltip(props, leafletObject);

    onMounted(async () => {
      const { tooltip }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Tooltip>(tooltip(options));

      propsBinder(methods, leafletObject.value, props);
      const listeners = remapEvents(context.attrs);
      leafletObject.value.on(listeners);
      leafletObject.value.setContent(props.content || root.value || "");
      bindTooltip(leafletObject.value);
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { root, leafletObject };
  },
  render() {
    return render(this.$slots);
  },
});
</script>
