<script lang="ts">
import type L from "leaflet";
import {
  onMounted,
  ref,
  provide,
  inject,
  nextTick,
  onBeforeUnmount,
  markRaw,
} from "vue";
import { debounce } from "ts-debounce";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  cancelDebounces,
  assertInject,
  isFunction,
} from "@src/utils.js";
import {
  markerProps,
  setupMarker,
  shouldBlankIcon,
} from "@src/functions/marker";
import { render } from "@src/functions/layer";
import {
  AddLayerInjection,
  CanSetParentHtmlInjection,
  SetIconInjection,
  SetParentHtmlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

/**
 * Marker component, lets you add and personalize markers on the map
 */
export default {
  name: "LMarker",
  props: markerProps,
  setup(props, context) {
    const leafletObject = ref<L.Marker>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    provide(
      CanSetParentHtmlInjection,
      () => !!leafletObject.value?.getElement()
    );
    provide(SetParentHtmlInjection, (html: string) => {
      const el =
        isFunction(leafletObject.value?.getElement) &&
        leafletObject.value?.getElement();
      if (!el) return;
      el.innerHTML = html;
    });
    provide(
      SetIconInjection,
      (newIcon: L.DivIcon | L.Icon) =>
        leafletObject.value?.setIcon && leafletObject.value.setIcon(newIcon)
    );
    const { options, methods } = setupMarker(props, leafletObject, context);

    const eventHandlers = {
      moveHandler: debounce(methods.latLngSync),
    };

    onMounted(async () => {
      const { marker, DomEvent, divIcon } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      if (shouldBlankIcon(options, context)) {
        options.icon = divIcon({ className: "" });
      }
      leafletObject.value = markRaw<L.Marker>(marker(props.latLng, options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);

      leafletObject.value.on("move", eventHandlers.moveHandler);
      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    onBeforeUnmount(() => cancelDebounces(eventHandlers));

    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
};
</script>
