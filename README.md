# Rendrui
[![npm version](https://img.shields.io/npm/v/rendrui)](https://www.npmjs.org/package/rendrui)

  A simple component for rendering JS objects in React. Supports editing and custom rendering.

# Install
  ```
  npm i rendrui
  ```

# Usage
  The simplest option is if you just need to visualize data

  ```JavaScript
  import { ObjectRenderer } from 'rendrui';

  const anySerializableData = {
    arr: [],
    obj: {},
    // ... any data
  };

  <ObjectRenderer
    dataToRender={anySerializableData}
    className="any-additional-class"
  />
  ```


## Build and publish
  Only for dev

  ```
  npm publish

  ```
