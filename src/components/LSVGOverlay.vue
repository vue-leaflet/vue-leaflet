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

import { SVGOverlayProps, setupSVGOverlay } from "@src/functions/SVGOverlay";
import { render } from "@src/functions/layer";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import {
  WINDOW_OR_GLOBAL,
  assertInject,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

/**
 * SVGOverlay component, used to load, display and provide DOM access to an SVG
 * file over specific bounds of the map
 */
export default defineComponent({
  name: "LSVGOverlay",
  props: SVGOverlayProps,
  setup(props, context) {
    const leafletObject = ref<L.SVGOverlay>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupSVGOverlay(props, leafletObject, context);

    onMounted(async () => {
      const { svgOverlay }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");
      console.log({ svgOverlay });

      leafletObject.value = markRaw<L.SVGOverlay>(
        svgOverlay(props.url, props.bounds, options)
      );

      const { listeners } = remapEvents(context.attrs);
      leafletObject.value.on(listeners);
      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
});
</script>
