/**
 * Helper form component for rendering new password inputs.
 *
 * This loads two password inputs and validates them within the component prior
 * to passing the valid password back up through props.
 */

// import primary libraries
import React, { useState} from 'react';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
// password validation regex

const strengthCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/;
// inputs of type password take a regex pattern to validate against but it can't have delimiters
// this will give us better messages in the form like 'please match the requested format'
const strengthCheckForInput = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$';

const NewPasswordInput = ({
  change
  , disabled
  , helpText
  , name
  , value
  , ...inputProps
}) => {

  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');

  const handleChange = (e) => {
    const { name: passwordName, value } = e.target;
    if(passwordName === 'pass1') {
      setPass1(value);
    } else if(passwordName === 'pass2') {
      setPass2(value);
    }
  }

  // when pass1 or pass2 changes, check if they match, if so pass the value up to the parent
  useEffect(() => {
    if(value && value === pass1 && value === pass2) {
      // if the value is already set and it matches both passwords, don't do anything
      return;
    } else if(pass1 === pass2 && strengthCheck.test(pass1)) {
      // send the valid password as an event to the parent component
      change({target: {name, value: pass1}});
    } else if(value) {
      // value is stale, clear it
      change({ target: { name, value: '' } });
    }
  }, [pass1, pass2, value, name, change])

  return (
    <div className='text-left'>
      <div className="relative z-0 w-full mb-4 text-left lg:w-auto">
        <label
          htmlFor={'pass1'}
          className="px-2 pt-1 text-xs absolute top-0 text-gray-500 bg-transparent z-10"
        >
          New Password <sup className="text-red-500">*</sup>
        </label>
        <input
          {...inputProps}
          disabled={disabled}
          name={'pass1'}
          onChange={handleChange}
          required={true}
          type="password"
          value={pass1}
          pattern={strengthCheckForInput}
          className={`px-2 text-base pt-5 pb-1 block w-full mt-0 ${strengthCheck.test(pass1) ? 'border-green-500' : 'border-red-500'}`}
        />
        {helpText ? <small><em>{helpText}</em></small> : null}
      </div>
      <div className="relative z-0 w-full mb-4 text-left lg:w-auto">
        <label
          htmlFor={'pass1'}
          className="px-2 pt-1 text-xs absolute top-0 text-gray-500 bg-transparent z-10"
        >
          Confirm Password <sup className="text-red-500">*</sup>
        </label>
        <input
          disabled={disabled}
          name={'pass2'}
          onChange={handleChange}
          required={true}
          type="password"
          value={pass2} 
          pattern={strengthCheckForInput}
          className={`px-2 text-base pt-5 pb-1 block w-full mt-0 ${value && value === pass2 ? 'border-green-500' : 'border-red-500'}`}
        />
        {pass1 && pass2 && pass1 !== pass2 ? <small className="text-red-500 pl-1">Passwords do not match</small> : null}
        {value && value === pass2 ? <small className="text-green-500 pl-1">Password valid</small> : null}
      </div>
    </div>
  )
}
NewPasswordInput.propTypes = {
  change: PropTypes.func.isRequired
  , helpText: PropTypes.any
  , name: PropTypes.string.isRequired
  , disabled: PropTypes.bool
}

export default NewPasswordInput;