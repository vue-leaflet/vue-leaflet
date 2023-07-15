<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import {
  controlProps,
  renderLControl,
  setupControl,
} from "@src/functions/control";
import { RegisterControlInjection } from "@src/types/injectionKeys";
import { assertInject, getLeaflet, propsBinder } from "@src/utils.js";

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
    const root = ref<HTMLInputElement>();

    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControl(props, leafletObject);

    onMounted(async () => {
      const { Control, DomEvent }: typeof L = await getLeaflet();

      const LControl = Control.extend({
        onAdd() {
          return root.value;
        },
      });

      leafletObject.value = markRaw<L.Control>(new LControl(options));
      propsBinder(methods, leafletObject.value, props);
      registerControl({ leafletObject: leafletObject.value });

      if (props.disableClickPropagation && root.value) {
        DomEvent.disableClickPropagation(root.value);
      }
      if (props.disableScrollPropagation && root.value) {
        DomEvent.disableScrollPropagation(root.value);
      }
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { root, leafletObject };
  },
  render() {
    return renderLControl(this.$slots);
  },
});
</script>
