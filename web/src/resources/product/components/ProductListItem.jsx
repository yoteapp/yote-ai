

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// import global components

// import services
import { useProductFromMap } from '../productService';

const ProductListItem = ({ id }) => {
  const product = useProductFromMap(id);

  if(!product) return <Skeleton />;
  return (
    <li className='list-none p-2 block'>
      <Link to={`/products/${product?._id}`}>{product?.title}</Link>
      <p>{product?.description}</p>
    </li>
  )
}

// custom loading skeleton for this component, by defining it right here we can keep it synced with any changes we make to the actual component above
const Skeleton = () => {
  return (
    <li className="animate-pulse list-none p-2 block cursor-default select-none">
      <p className='bg-gray-600 text-gray-600 w-fit'>Product Title</p>
      <p className='bg-gray-400 text-gray-400 w-fit'>This is a sample product description</p>
    </li>
  )
}
// add the skeleton to the component so we can access it in other components (ProductList in this case)
ProductListItem.Skeleton = Skeleton;

ProductListItem.propTypes = {
  id: PropTypes.string.isRequired
}

export default ProductListItem;