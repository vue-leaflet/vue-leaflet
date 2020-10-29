import { onBeforeUnmount, inject } from "vue";
import { props as popperProps, setup as popperSetup } from "./popper";

export const props = {
  ...popperProps,
  latLng: {
    type: [Object, Array],
    default: () => [],
  },
};

export const setup = (props, leafletRef) => {
  const { options, methods } = popperSetup(props, leafletRef);
  const unbindPopup = inject("unbindPopup");

  onBeforeUnmount(() => {
    unbindPopup();
  });

  return { options, methods };
};
