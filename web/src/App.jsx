import React, { Suspense, useEffect } from 'react';
import './App.css';

import routes from './config/routes';
import DefaultLayout from './global/components/layouts/DefaultLayout';


/**
 * We add these listeners to prevent the default browser behavior when a file is dragged over the window which is to open/download the file
 * The problem arises when a user drags a file over the window and then drops it on a non-file input element.
 * By preventing the default behavior, we can prevent the file from being opened/downloaded EXCEPT when the user drops the file on a file
 * input element (which is handled in the `FileInput` component by setting input.dropzone true).
 */
window.addEventListener("dragenter", function (e) {
  if(!e.target.dropzone) {
    e.preventDefault();
    e.dataTransfer.effectAllowed = "none";
    e.dataTransfer.dropEffect = "none";
  }
}, false);

window.addEventListener("dragover", function (e) {
  if(!e.target.dropzone) {
    e.preventDefault();
    e.dataTransfer.effectAllowed = "none";
    e.dataTransfer.dropEffect = "none";
  }
});

window.addEventListener("drop", function (e) {
  if(!e.target.dropzone) {
    e.preventDefault();
    e.dataTransfer.effectAllowed = "none";
    e.dataTransfer.dropEffect = "none";
  }
});

function App() {
  useEffect(() => {
    // we are using lazy loading to load our resource routers to reduce the initial bundle size
    // we can preload the resource routers here so they are ready to go once the user needs them
    import('./resources/product/ProductRouter');
    import('./resources/user/UserRouter');
    // add any other top level resource routers here that you want to preload
  }, []) // run once on mount

  // because we are using lazy loading at the route level, we need to wrap our routes in a Suspense component which will show a fallback while the route is loading
  // if we want a more specific fallback somewhere down the tree, we can add a Suspense component there as well (most likely in an individual resource router)
  return (
    <Suspense fallback={<DefaultLayout.Skeleton />}>
      {routes}
    </Suspense>
  );
}

export default App;
