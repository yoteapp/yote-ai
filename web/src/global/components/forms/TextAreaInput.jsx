/**
 * Helper component for rendering textarea inputs
 */

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';

const TextAreaInput = ({
  change
  , cols
  , disabled
  , helpText
  , label
  , maxlength
  , name
  , placeholder
  , required
  , rows
  , value
}) => {
  return (
    <div className="relative z-0 w-full mb-4 text-left lg:w-auto">
      {label ? (
        <label
          htmlFor={name}
          className="px-2 pt-1 text-xs absolute top-0 text-gray-500 bg-transparent z-10"
        >
          {label} <sup className="text-red-500">{required ? '*' : null}</sup>
        </label>
        )
        :
        null
      }
      <textarea
        className={`px-2 text-base ${label ? 'pt-5 pb-1' : 'pt-3 pb-3'} block w-full mt-0`}
        cols={cols}
        disabled={disabled}
        maxLength={maxlength}
        name={name}
        onChange={change}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />
      {helpText && <small className="text-xs text-gray-500"><em>{helpText}</em></small>}
    </div>
  )
}

TextAreaInput.propTypes = {
  change: PropTypes.func.isRequired
  , cols: PropTypes.number
  , disabled: PropTypes.bool
  , helpText: PropTypes.any
  , label: PropTypes.string
  , maxlength: PropTypes.number
  , name: PropTypes.string.isRequired
  , placeholder: PropTypes.string
  , required: PropTypes.bool
  , rows: PropTypes.number
  , value: PropTypes.string.isRequired
}

TextAreaInput.defaultProps = {
  disabled: false
  , helpText: null
  , label: ''
  , placeholder: ''
  , required: false
  , rows: 4
}

export default TextAreaInput;
