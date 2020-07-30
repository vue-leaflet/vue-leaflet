export const props = {
  tms: {
    type: Boolean,
    default: false
  },
  subdomains: {
    type: String,
    default: 'abc'
  },
  detectRetina: {
    type: Boolean,
    default: false
  }
};

export const setup = props => {
  const options = {
    tms: props.tms,
    subdomains: props.subdomains,
    detectRetina: props.detectRetina
  };
  return options;
};
