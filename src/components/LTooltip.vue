<script lang="ts">
import type L from "leaflet";
import {
  onMounted,
  ref,
  inject,
  nextTick,
  markRaw,
  defineComponent,
} from "vue";
import {
  assertInject,
  propsBinder,
  remapEvents,
  WINDOW_OR_GLOBAL,
} from "@src/utils.js";
import { tooltipProps, setupTooltip } from "@src/functions/tooltip";
import { render } from "@src/functions/popper";
import {
  BindTooltipInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

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
      const { tooltip, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Tooltip>(tooltip(options));

      propsBinder(methods, leafletObject.value, props);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);
      leafletObject.value.setContent(props.content || root.value);
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
