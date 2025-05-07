# Rendrui
   A simple component for rendering JS objects in React. Supports editing and custom rendering.

# Install
  ```
  npm i rendrui
  ```

# Usage
  The simplest option is if you just need to visualize data
  
  ```JavaScript
  import { ObjectRenderer } from 'rendrui';

  cons anySerializableData = {
    arr: [],
    obj: {},
    //...
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
