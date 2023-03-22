/**
 * Helper component for rendering a debounced search input
 * Waits `debounceTime` ms before firing change event
 */

// import primary libraries
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useCallback } from 'react';

const SearchInput = ({
  autoFocus
  , change
  , disabled
  , helpText
  , name
  , placeholder = "Search"
  , required
  , value
  , debounceTime = 0
}) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState('');
  const handleChange = useCallback((newValue) => {
    change({ target: { name, value: newValue } });
  }, [change, name])

  useEffect(() => {
    // Fire change event after delay
    const handler = setTimeout(() => {
      if(debouncedValue !== value) {
        handleChange(debouncedValue);
      }
    }, debounceTime);
    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [handleChange, debouncedValue, debounceTime]);

  useEffect(() => {
    if(value !== debouncedValue) {
      setDebouncedValue(value);
    }
  }, [value]);

  return (
    <div
      className="relative w-full lg:w-auto border-transparent z-10"
    >
      <MagnifyingGlassIcon className="absolute top-0 left-0 w-4 h-4 mt-3 ml-5 text-gray-500" />
      <input
        autoFocus={autoFocus}
        disabled={disabled}
        name={name}
        // send the event immediately when the user presses the enter key
        onKeyPress={(e) => e.key === 'Enter' && handleChange(debouncedValue)}
        onChange={(e) => setDebouncedValue(e.target.value)}
        placeholder={placeholder}
        required={required}
        type="text"
        value={debouncedValue}
        className={`px-2 pl-10 text-sm text-left pt-2 pb-2 block w-full mt-0 rounded-full `}
      />
      {helpText && <small className="block"><em>{helpText}</em></small>}
    </div>
  )
}

SearchInput.propTypes = {
  change: PropTypes.func.isRequired
  , disabled: PropTypes.bool
  , helpText: PropTypes.any
  // , label: PropTypes.string // search inputs don't have labels, only placeholders
  , name: PropTypes.string.isRequired
  , placeholder: PropTypes.string
  , required: PropTypes.bool
  , value: PropTypes.string.isRequired
}

SearchInput.defaultProps = {
  disabled: false
  , helpText: null
  , label: ''
  , placeholder: ''
  , required: false
}

export default SearchInput;
