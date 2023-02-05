import { onBeforeUnmount, inject } from "vue";
import { popperProps, setupPopper } from "./popper";

export const tooltipProps = {
  ...popperProps,
};

export const setupTooltip = (props, leafletRef) => {
  const { options, methods } = setupPopper(props, leafletRef);

  const unbindTooltip = inject("unbindTooltip");

  onBeforeUnmount(() => {
    unbindTooltip();
  });

  return { options, methods };
};
