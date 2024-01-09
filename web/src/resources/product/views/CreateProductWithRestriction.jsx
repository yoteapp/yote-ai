/**
 * View component for /products/new-with-restriction
 *
 * Creates a new product from a copy of the defaultItem in the product store
 */

// import primary libraries
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn.jsx'

// import resource components
import ProductForm from '../components/ProductForm.jsx'
import ProductLayout from '../components/ProductLayout.jsx'

// import services
import { useCreateProductWithRequiredParams } from '../productService.js'

const CreateProductWithRestriction = () => {
  const history = useHistory();
  const location = useLocation();

  const { data: product, handleChange, handleSubmit, isChanged, ...productQuery } = useCreateProductWithRequiredParams({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new product
    , onResponse: (newProduct, error) => {
      if(error || !newProduct) {
        alert(error || 'An error occurred.')
        history.replace(`/products/mine`, location.state);
      } else {
        history.replace(`/products/${newProduct._id}`, location.state);
      }
    }
    , requiredParam: 'super-fancy' // this is checked on the server before creating the product
    // , requiredParam: 'this-will-fail'
  });

  // render UI based on data and loading state
  return (
    <ProductLayout title={'New Super Fancy Product'}>
      <WaitOn query={productQuery}>
        <ProductForm
          product={product}
          cancelLink='/products'
          disabled={productQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ProductLayout>
  )
}

export default CreateProductWithRestriction
