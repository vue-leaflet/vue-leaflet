import { onBeforeUnmount, inject } from "vue";
import { props as popperProps, setup as popperSetup } from "./popper";

export const props = {
  ...popperProps,
};

export const setup = (props, leafletRef) => {
  const { options, methods } = popperSetup(props, leafletRef);
  const unbindTooltip = inject("unbindTooltip");

  onBeforeUnmount(() => {
    unbindTooltip();
  });

  return { options, methods };
};
