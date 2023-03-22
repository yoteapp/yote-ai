/**
 * Helper form component for rendering file inputs.  This handles its own state
 * and validation. Will only return file to parent component if valid.
 *
 */

// import primary libraries
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

const FileInput = ({
  accept
  , change
  , disabled
  , helpText
  , label
  , name
  , required
  , value
}) => {
  const [error, setError] = useState(null);
  const [file, setFile] = useState(value);
  // we'll use this to style the dropzone when a file is being dragged over it
  const [dragging, setDragging] = useState(false);
  // keep the file state in sync with the value prop
  useEffect(() => {
    setFile(value);
  }, [value])

  const onChange = e => {
    const newFile = e.target.value;
    setFile(newFile);
    const fileIsValid = validateFile(newFile);
    if(fileIsValid) {
      // file is valid, clear error and send the valid file as an event
      setError(null);
      change({
        target: {
          name: name
          , value: e.target.files[0] // this is the important bit
        }
      });
    } else {
      // file is invalid, set error and send an empty string as an event
      setError("Please enter a valid file");
      change({
        target: {
          name: name
          , value: ""
        }
      });
    }
  }

  return (
    <div
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDragOver={() => setDragging(true)}
      onDrop={() => setDragging(false)}
      className={`relative z-0 w-full mb-4 text-left lg:w-auto`}
    >
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
      <input
        // add a reference on the event target so we can tell if the event is coming from the dropzone or not
        ref={input => input && (input.dropzone = true)}
        accept={accept}
        disabled={disabled}
        name={name}
        onChange={onChange}
        required={required}
        type="file"
        value={file?.name}
        multiple={true}
        className={`px-2 text-base border border-dashed ${label ? 'pt-6 pb-2' : 'pt-4 pb-4'} block w-full mt-0 hover:cursor-pointer ${dragging ? 'bg-info-light border-info-dark' : 'border-gray-300'}`}
      />
      {error && <small className="text-xs text-red-800"><em>{error}</em></small>}
      {helpText && <small className="text-xs text-gray-500"><em>{helpText}</em></small>}
    </div>
  )
}

FileInput.propTypes = {
  change: PropTypes.func.isRequired
  , disabled: PropTypes.bool
  , helpText: PropTypes.any
  , label: PropTypes.string
  , name: PropTypes.string.isRequired
  , required: PropTypes.bool
  , value: PropTypes.string
}

FileInput.defaultProps = {
  disabled: false
  , helpText: null
  , label: ''
  , required: false
}

export default FileInput;

// could move this to a util but it's probably never going to used outside this component
const validateFile = file => {
  return true;
}