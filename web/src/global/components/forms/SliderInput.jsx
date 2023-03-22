/**
 * Helper component for rendering basic slider inputs (styled checkbox inputs)
 */

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';

const SliderInput = ({
  change
  , disabled
  // , helpText // TODO
  , label
  , name
  , value
}) => {
  return (
    <div className="flex flex-row">
      <label className="relative group flex py-2 text-sm">
        <input className="appearance-none peer h-0 w-0 border-none"
          checked={!!value} type="checkbox" 
          disabled={disabled}
          onChange={e => {
            change({
              target: {
                name: name
                , value: e.target.checked
              }
            })
          }} 
        />
        <span className={`${!disabled && 'group-hover:after:translate-x-1'} w-12 h-6 flex items-center flex-shrink-0 p-1 bg-gray-300 rounded-full duration-300 ease-in-out peer-checked:bg-indigo-600 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-6`}></span>
      </label>
      { label ? 
        <div className="flex flex-col justify-center p-2 text-sm whitespace-nowrap">
          <p className={disabled ? "opacity-80" : ""}>{label}</p>
        </div>
      : null
      }
    </div>
  )
}

SliderInput.propTypes = {
  change: PropTypes.func.isRequired
  , disabled: PropTypes.bool
  // , helpText: PropTypes.any
  , label: PropTypes.string
  , name: PropTypes.string
  , value: PropTypes.bool.isRequired
}

SliderInput.defaultProps = {
  disabled: false
  // , helpText: null
  , label: ''
  , required: false
}

export default SliderInput;
