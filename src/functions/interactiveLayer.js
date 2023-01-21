import { props as componentProps, setup as componentSetup } from "./component";

export const props = {
  ...componentProps,
  interactive: {
    type: Boolean,
  },
  bubblingMouseEvents: {
    type: Boolean,
  },
};

export const setup = (props) => {
  const { options: componentOptions, methods } = componentSetup(props);
  const options = {
    ...componentOptions,
    interactive: props.interactive,
    bubblingMouseEvents: props.bubblingMouseEvents,
  };

  return { options, methods };
};
