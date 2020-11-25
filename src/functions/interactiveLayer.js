import { props as componentProps, optionsMerger } from "./component";

export const props = {
  ...componentProps,
  interactive: {
    type: Boolean,
    default: true,
  },
  bubblingMouseEvents: {
    type: Boolean,
    default: true,
  },
};

export const setup = (props) => {
  const options = optionsMerger(
    {
      interactive: props.interactive,
      bubblingMouseEvents: props.bubblingMouseEvents,
    },
    props
  );

  const methods = {};

  return { options, methods };
};
