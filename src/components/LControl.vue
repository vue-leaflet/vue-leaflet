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

import { controlProps, render, setupControl } from "@src/functions/control";
import {
  RegisterControlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import { WINDOW_OR_GLOBAL, assertInject, propsBinder } from "@src/utils.js";

export default defineComponent({
  name: "LControl",
  props: {
    ...controlProps,
    disableClickPropagation: {
      type: Boolean,
      custom: true,
      default: true,
    },
    disableScrollPropagation: {
      type: Boolean,
      custom: true,
      default: false,
    },
  },
  setup(props, context) {
    const leafletObject = ref<L.Control>();
    const root = ref(null);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControl(props, leafletObject);

    onMounted(async () => {
      const { Control, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      const LControl = Control.extend({
        onAdd() {
          return root.value;
        },
      });

      leafletObject.value = markRaw<L.Control>(new LControl(options));
      propsBinder(methods, leafletObject.value, props);
      registerControl({ leafletObject: leafletObject.value });

      if (props.disableClickPropagation) {
        DomEvent.disableClickPropagation(root.value);
      }
      if (props.disableScrollPropagation) {
        DomEvent.disableScrollPropagation(root.value);
      }
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { root, leafletObject };
  },
  render() {
    return render(this.$slots);
  },
});
</script>
