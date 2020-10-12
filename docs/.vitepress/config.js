const path = require("path");
const fs = require("fs");
const componentsFolder = path.join(__dirname, "../components/");
const examplesFolder = path.join(__dirname, "../examples/");

const components = fs
  .readdirSync(componentsFolder)
  .filter((c) => c !== "index.md");

const examples = fs.readdirSync(examplesFolder).filter((c) => c !== "index.md");

module.exports = {
  title: "Vue Leaflet",
  description: "Documentations, API, and FAQ for vue leaflet",
  themeConfig: {
    sidebar: {
      "/components/": components,
      "/examples/": examples,
    },
    nav: [
      { text: "Intro", link: "/" },
      { text: "Quickstart", link: "/quickstart/" },
      //   { text: "Components", link: "/components/" },
      //   { text: "Examples", link: "/examples/" },
      //   { text: "FAQ", link: "/faq/" },
      { text: "Plugins", link: "/plugins/" },
    ],
  },
};
