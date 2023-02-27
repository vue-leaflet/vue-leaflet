export const componentProps = {
  options: {
    type: Object,
    default: () => ({}),
    custom: true,
  },
};

export const setupComponent = (props) => {
  return { options: props.options, methods: {} };
};
