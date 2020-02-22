# vue-leaflet

> Vue Leaflet Next

## Description

This repo contains the WIP to rewrite the vue2-leaflet codebase for vue3 this is High experimental and can be broken at any time, is not actually working as a plugin for now.
The aim is to experiment with various techniques and architectures for vue3.

## Current architecture

- replace mixins with composition API
- use provide/inject instead of `findRealParent`
- simplify simplify and simplify the old codebase
- SSR compatible from the get-go

## What is available now

- a playground page with a working map
- example on how we should build the functions

## Build setup

### [yarn](https://yarnpkg.com) - recommend

```bash
# Install dependencies
yarn install

# Server with hot reload at localhost:5000
yarn run dev

# Build for production with minification
yarn run build
```

### [npm](https://www.npmjs.com/)

```bash
# Install dependencies
npm install

# Server with hot reload at localhost:5000
npm run dev

# Build for production with minification
npm run build
```

## Reference

- For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

## License

MIT © Nicolò Maria Mezzopera <nicolo.mezzopera@gmail.com>
