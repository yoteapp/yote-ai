/**
 * Helper component for rendering styled select inputs that can be filtered or not
 * Adapted from here: https://headlessui.com/react/combobox
 */

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
/**
 * Handles arrays of objects and arrays of strings
 * NOTE: if you pass an array of objects, you must also pass a displayKey and valueKey, if you pass an array of strings, you can pass a displayKey and valueKey, but they will be ignored
 * @param {Object} props
 * @param {boolean?} props.autoFocus - whether the input should be focused on mount
 * @param {function} props.change - the change handler for the input
 * @param {string?} props.className - the className for the input wrapper
 * @param {number?} props.debounceTime - the debounce time for the filter in ms (if any)
 * @param {boolean} props.disabled - whether the input is disabled
 * @param {string?} props.displayKey - the key to use for the display value if items is an array of objects, do not set if items is an array of strings
 * @param {boolean} props.filterable - whether the input is filterable (false by default)
 * @param {function} props.handleFilter - the optional filter handler for the input, if not passed, the default filter will be used
 * @param {string} props.helpText - the help text to display below the input
 * @param {(string[]|object[])} props.items - the items to display in the list, can be an array of strings or objects
 * @param {string} props.label - the label for the input
 * @param {boolean?} props.multiple - whether the input is a multiple select, if true, selectedValue must be an array of strings or objects
 * @param {string} props.name - the name of the input
 * @param {string?} props.placeholder - the placeholder for the input
 * @param {boolean} props.required - whether the input is required
 * @param {(string|string[])} props.selectedValue - the current value of the input, for multiple selects, this is an array of values
 * @param {string?} props.valueKey - the key to use for the value if items is an array of objects, do not set if items is an array of strings
 */
const SelectInput = ({
  autoFocus = false
  , change
  , className
  , debounceTime = 250
  , disabled
  , displayKey
  , filterable = false
  , handleFilter
  , helpText
  , items
  , label
  , multiple
  , name
  , placeholder = '-- Select --'
  , required
  , selectedValue
  , valueKey
}) => {
  if(handleFilter) filterable = true; // if a handleFilter function is passed, we should assume the user wants to filter the items

  const [filteredItems, setFilteredItems] = useState(null);
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState('');

  // always set the filtered items to the items prop when it changes (to support mutation of the items array from outside the component)
  useEffect(() => {
    setFilteredItems(items || []);
  }, [items])

  useEffect(() => {
    // Fire search event after delay
    const handler = setTimeout(() => {
      setFilter(debouncedValue);
    }, debounceTime);
    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [debouncedValue, debounceTime]); // Only re-call effect if value or delay changes

  if(multiple && !Array.isArray(selectedValue)) {
    console.error(`Error in SelectInput for name: ${name}: selectedValue must be an array for multiple select, received ${typeof selectedValue}`, selectedValue);
    return null;
  }
  if(items?.[0] && typeof items?.[0] === 'object' && (!displayKey || !valueKey)) {
    console.error(`Error in SelectInput for name: ${name}: if items is an array of objects, you must also pass displayKey and valueKey`);
    return null;
  }
  if(items?.[0] && typeof items?.[0] === 'string' && (displayKey || valueKey)) {
    console.warn(`Error in SelectInput for name: ${name}: if items is an array of strings, you shouldn't pass a displayKey or valueKey`);
  }

  // get the item type so we know how to handle it
  const itemType = typeof items?.[0]

  // default search filter if no onSearch is passed, will filter the items array by the displayKey (or the item itself if it's a string)
  const filterItems = (searchString) => {
    if((!searchString || !filteredItems) && items?.length) {
      setFilteredItems(items);
    }
    if(items?.[0] && typeof items?.[0] === 'object') {
      setFilteredItems(items.filter(item => item[displayKey].toLowerCase().includes(searchString.toLowerCase())));
    }
    if(items?.[0] && typeof items?.[0] === 'string') {
      setFilteredItems(items.filter(item => item.toLowerCase().includes(searchString.toLowerCase())));
    }
  }

  // if handleFilter is passed, use that, otherwise use the default filter
  const setFilter = handleFilter || filterItems;

  const getSelectedItem = () => {
    if(!selectedValue) return null;
    if(itemType === 'string') {
      // return a string containing each selected item separated by a comma
      if(multiple) return items?.filter(item => item && selectedValue.includes(item));
      return selectedValue;
    } else {
      if(multiple) return items?.filter(item => item && selectedValue.includes(item[valueKey]));
      return items?.find(item => item && item[valueKey] == selectedValue);
    }
  }
  const selectedItem = getSelectedItem();

  const getItemDisplayValue = (item) => {
    if(!item) return null;
    if(Array.isArray(item)) return item.map(i => getItemDisplayValue(i)).join(', ');
    if(typeof item === 'object') return item[displayKey];
    return item;
  }

  const handleChange = (newSelection) => {
    // can be a string or an array of strings
    if(itemType === 'string') {
      return change({ target: { name, value: newSelection } });
    } else {
      if(multiple) {
        const selectedValues = newSelection.map(item => item[valueKey]);
        return change({ target: { name, value: selectedValues } });
      } else {
        return change({ target: { name, value: newSelection[valueKey] } });
      }
    }
  }

  return (
    <Combobox
      as="div"
      className={`relative w-full max-w-xs border-transparent z-20 text-left ${className}`}
      disabled={disabled}
      onChange={handleChange}
      name={name}
      value={selectedItem}
      by={itemType === 'string' ? undefined : valueKey}
      multiple={multiple}
    >
      {label ? (
        <Combobox.Label
          htmlFor={name}
          className="px-2 pt-1 text-xs absolute top-0 text-gray-500 bg-transparent z-10"
        >
          {label} <sup className="text-red-500">{required ? '*' : null}</sup>
        </Combobox.Label>
      )
        :
        null
      }
      <div className="relative">
        {filterable ? (
          <Combobox.Input
            autoFocus={autoFocus}
            name={name}
            className={`px-2 min-h-[44px] text-sm text-gray-800 text-left truncate ${label ? 'pt-5 pb-1' : 'pt-3 pb-2'} border-none block w-11/12 mt-0 disabled:opacity-50`}
            onChange={(e) => setDebouncedValue(e.target.value)}
            displayValue={(item => !item ? debouncedValue : getItemDisplayValue(item))}
            placeholder={placeholder}
          />
        )
        : (
          <Combobox.Input
            autoFocus={autoFocus}
            name={name}
            as={'div'} // not filterable, so we don't want an input, just a div with the selected item or placeholder
            className={`px-2 min-h-[44px] text-sm text-gray-800 text-left truncate ${label ? 'pt-5 pb-1' : 'pt-3 pb-2'} border-none block w-11/12 mt-0 disabled:opacity-50`}
            onChange={(e) => setDebouncedValue(e.target.value)}
            displayValue={(item => !item ? debouncedValue : getItemDisplayValue(item))}
            placeholder={placeholder}
          >
            {
              selectedItem ? (
                <span className="truncate">{getItemDisplayValue(selectedItem)}</span>
              ) :
                <span className="text-gray-400">{placeholder}</span>
            }
          </Combobox.Input>
        )}
        <Combobox.Button
          className={`absolute top-0 bottom-0 px-2 text-sm text-gray-800 text-left overflow-x-hidden ${label ? 'pt-5 pb-1' : 'pt-3 pb-2'} block w-full mt-0 border border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-400 disabled:opacity-50`}
        >
          {({ open }) => (
            <>
              {open ? <ChevronUpIcon className="h-5 w-5 text-gray-400 bg-white absolute right-2 top-2.5" aria-hidden="true" /> : <ChevronDownIcon className="h-5 w-5 text-gray-400 bg-white absolute right-2 top-2.5" aria-hidden="true" />}
            </>
          )}
        </Combobox.Button>
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
          afterLeave={() => setDebouncedValue('')}
        >
          <Combobox.Options className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-sm bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredItems?.length ?
              filteredItems.map((item) => (
                item && (
                  <Combobox.Option
                    key={`option_${itemType === 'string' ? item : item[valueKey]}`}
                    value={item}
                    className={({ active }) =>
                      classNames(
                        'relative cursor-default select-none py-2 pl-4 pr-4',
                        active ? 'bg-gray-100' : 'text-gray-900'
                      )
                    }
                  >
                    {({ active, selected }) => (
                      multiple ? (
                        <>
                          <span className={classNames('block truncate pl-4', selected && 'font-semibold text-indigo-600')}>{itemType === 'string' ? item : item[displayKey]}</span>
                          {selected && (
                            <span
                              className='absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600'
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      ) : (
                        <span className={classNames('block truncate', selected && 'font-semibold text-indigo-600')}>{itemType === 'string' ? item : item[displayKey]}</span>
                      )
                    )}
                  </Combobox.Option>
                )
              ))
              :
              <div className="p-2">No results</div>
            }
          </Combobox.Options>
        </Transition>
      </div>
      {helpText && <small className="block"><em>{helpText}</em></small>}
    </Combobox>
  )
}

SelectInput.propTypes = {
  autoFocus: PropTypes.bool
  , change: PropTypes.func.isRequired
  , className: PropTypes.string
  , debounceTime: PropTypes.number
  , disabled: PropTypes.bool
  , displayKey: PropTypes.string
  , helpText: PropTypes.any
  , handleFilter: PropTypes.func // if you want to override the default search (to fire off an API call, for example)
  , items: PropTypes.array.isRequired
  , label: PropTypes.string
  , multiple: PropTypes.bool
  , name: PropTypes.string.isRequired
  , placeholder: PropTypes.string
  , required: PropTypes.bool
  , selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
  , valueKey: PropTypes.string
}

export default SelectInput;
