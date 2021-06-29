// define fetch hooks here like useProductList that return an existing list or fetch and return
// useSingleProduct returns productMap[id] or fetches and returns the single product and adds it to the map

/**
 * This set of hooks is how we'll interact with the productStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * into the components.
 */

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';

// import all of the actions from the store
import {
  selectListItems
  , fetchProductList
  , selectShouldFetch
  , selectFetchStatus
  , selectListPageCount
  , selectSingleById
  , fetchSingleProduct
  , fetchDefaultProduct
  , sendCreateProduct
  , sendUpdateProduct
  , invalidateQuery
  , addProductToList
} from './productStore';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to access the defaultProduct and the sendCreateProduct action
 * 
 * @returns an object containing the dispatched `sendCreateProduct` action and the fetch for the default product
 * @example // to use in a component
 * // access the create function and fetch the default product
 * const { sendUpdateProduct, item: defaultProduct, ...productFetch } = useCreateProduct(productId);
 * // send the new product
 * sendCreateProduct(newProduct);
 */
export const useCreateProduct = () => {
  const dispatch = useDispatch();
  // return the default product and the sendCreateProduct action
  const defaultProductFetch = useGetDefaultProduct();
  return {
    sendCreateProduct: (newProduct) => dispatch(sendCreateProduct(newProduct)),
    ...defaultProductFetch
  }
}

// READ

/**
 * This hook will check for a fresh product in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the product to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the product (as `item`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetSingleProduct = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // get current list status (if it exists)
  const status = useSelector((store) => selectFetchStatus(store, id));
  // get current list data (if it exists)
  const item = useSelector((store) => selectSingleById(store, id));
  // use the util to check if we need to fetch from the server
  const shouldFetch = useSelector((store) => selectShouldFetch(store, id));
  useEffect(() => {
    // only fetch if we need to
    if(forceFetch || shouldFetch) {
      dispatch(fetchSingleProduct(id))
    }
    // this is the dependency array. useEffect will run anytime one of these changes
  }, [id, forceFetch, shouldFetch, dispatch]);

  const isFetching = status === 'pending' || status === undefined
  const isLoading = isFetching && !item;
  const isError = status === 'rejected'
  const isSuccess = status === 'fulfilled'

  // return the info for the caller of the hook to use
  return {
    item,
    isFetching,
    isLoading,
    isError,
    isSuccess,
    invalidate: () => dispatch(invalidateQuery(id)),
    refetch: () => dispatch(fetchSingleProduct(id))
  }
}

/**
 * NOTE: If you are using this because you want to create a new product, try `useCreateProduct`
 * instead. It returns the defaultProduct and the `sendCreateProduct` action in one go.
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultProduct (as `item`)
 */
export const useGetDefaultProduct = (forceFetch = false) => {
  const dispatch = useDispatch();
  // get current list status (if it exists)
  const status = useSelector((store) => selectFetchStatus(store, 'defaultItem'))
  // get current list data (if it exists)
  const item = useSelector((store) => selectSingleById(store, 'defaultItem'))
  const shouldFetch = useSelector((store) => selectShouldFetch(store, 'defaultItem'))
  useEffect(() => {
    // on mount or listArgs change, if no status send a request for the list
    if(forceFetch || shouldFetch) {
      dispatch(fetchDefaultProduct())
    }
  }, [forceFetch, shouldFetch, dispatch]);

  const isFetching = status === 'pending' || status === undefined
  const isLoading = isFetching && !item;
  const isError = status === 'rejected'
  const isSuccess = status === 'fulfilled'
  // return the info for the caller of the hook to use
  return { item, isFetching, isLoading, isError, isSuccess }
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {object} listArgs - an object used to construct the query
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the product list (as `list`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetProductList = (listArgs = {}, forceFetch = false) => {

   /**
   * NOTE: tracking lists using the query string is easy because the `listArgs` passed into
   * dispatch(fetchProductList(listArgs)) are accessed in the store by using action.meta.arg.
   * We could try setting the queryKey to something different (or nesting it) but we'd need to figure
   * out how to access that info in the store. Maybe by passing it along as a named object like:
   * 
   * dispatch(fetchProductList({queryString: listArgs, queryKey: someParsedVersionOfListArgs}))
   * 
   * TODO: Separate pagination from the rest of the list args, or nest it under pagination: {}.
   * That way we can clean up the query key, but ALSO PREFETCH THE NEXT PAGE. If the use is on page 3
   * then fetch page 4 and 2. Use clicks 4 then fetch 5 and 3.
   */

  // convert the query object to a query string for the new server api
  // also makes it easy to track the lists in the reducer by query string
  const queryString = apiUtils.queryStringFromObject(listArgs) || "all"

  // get current list status (if it exists)
  const status = useSelector((store) => selectFetchStatus(store, queryString))
  // get total document count for proper pagination
  const totalPages = useSelector((store) => selectListPageCount(store, queryString))
  // get current list data (if it exists)
  const products = useSelector((store) => selectListItems(store, queryString))
  
  const shouldFetch = useSelector((store) => selectShouldFetch(store, queryString))
  
  const dispatch = useDispatch();
  useEffect(() => {
    // on mount or listArgs change, if no status send a request for the list
    if(forceFetch || shouldFetch) {
      dispatch(fetchProductList(queryString))
    }
  }, [status, queryString, forceFetch, shouldFetch, dispatch]);

  
  // PREFETCH

  // if we are using pagination, check if we need to fetch the NEXT page.
  const nextQueryString = listArgs.page && listArgs.page < totalPages ? apiUtils.queryStringFromObject({ ...listArgs, page: Number(listArgs.page) + 1 }) : null;
  const shouldFetchNext = useSelector((store) => selectShouldFetch(store, nextQueryString))

  useEffect(() => {
    if(nextQueryString && shouldFetchNext) {
      // fetch the next page now
      dispatch(fetchProductList(nextQueryString))
    }
  }, [nextQueryString, shouldFetchNext, dispatch]);

  const isFetching = status === 'pending' || status === undefined
  const isLoading = isFetching && !products;
  const isError = status === 'rejected'
  const isSuccess = status === 'fulfilled'

  // return the info for the caller of the hook to use
  return {
    products,
    totalPages,
    isFetching,
    isLoading,
    isError,
    isSuccess,
    invalidate: () => dispatch(invalidateQuery(listArgs)),
    refetch: () => dispatch(fetchProductList(listArgs))
  }
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateProduct` action
 * 
 * Useful if you want to update a product that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableProduct` if you want to fetch and update a product
 * 
 * @returns the sendUpdateProduct action wrapped in dispatch
 * @example // to use in a component
 * // access the update function
 * const { sendUpdateProduct } = useUpdateProduct();
 * // send the update
 * sendUpdateProduct(updatedProduct);
 */
export const useUpdateProduct = () => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateProduct: (updatedProduct) => dispatch(sendUpdateProduct(updatedProduct)),
  }
}

/**
 * Use this hook to fetch a product and access the `sendUpdateProduct` action
 * 
 * Under the hood it combines `useGetSingleProduct` and `useUpdateProduct` in a more convenient package
 * 
 * @param {string} id - the id of the product to be fetched and updated.
 * @returns an object containing the sendUpdateProduct function and the fetch for the product id passed in
 * @example // to use in a component
 * // access the update function and fetch the product
 * const { sendUpdateProduct, item: product, ...productFetch } = useUpdateProduct(productId);
 * // send the update
 * sendUpdateProduct(updatedProduct);
 */
export const useGetUpdatableProduct = (id) => {
  // use the existing hook to fetch the product
  const productFetch = useGetSingleProduct(id);
   // use the existing hook to access the update action
  const { sendUpdateProduct } = useUpdateProduct();
  return {
    // return the update action and the product fetch
    sendUpdateProduct: sendUpdateProduct,
    ...productFetch
  }
}

// TODO: Add delete


// OTHERS

/**
 * @returns the `addProductToList` function wrapped in dispatch
 */
export const useAddProductToList = () => {
  const dispatch = useDispatch();
  return {
    addProductToList: (productId, listArgs) => dispatch(addProductToList({id: productId, listArgs: listArgs}))
  }
}

/**
 * NOTE: Only use this if you're sure the product is already in the store. WILL NOT fetch from the server.
 * @param {string} productId - the id of the product that you want to grab from the store
 * @returns the product from the store's byId map.
 */
export const useProductFromMap = (productId) => {
  const product = useSelector((store) => selectSingleById(store, productId));
  return product
}
