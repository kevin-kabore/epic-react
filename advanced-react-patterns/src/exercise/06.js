// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {Switch} from '../switch'
import warning from 'warning'

const callAll = (...fns) => (...args) => fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn,
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)

  const onIsControlled = controlledOn !== null
  // passing on without onChange
  if (onIsControlled && !onChange) {
    warning(
      false,
      'You provided an `on` prop to a Toggle without an `onChange` handler. This will render a read-only field. If the field should be mutable, set `onChange`.',
    )
  }

  const on = onIsControlled ? controlledOn : state.on

  function dispatchWithOnChange(action) {
    // passing a value for on and later passing undefined or null
    if (onIsControlled && (on === undefined || on === null)) {
      warning(
        false,
        'A component is changing a controlled Toggle to be uncontrolled. This is likely caused by the value changing from a defined to undefined, which should not happen. Decide between using a controlled or uncontrolled Toggle for the lifetime of the component.',
      )
    }
    // passing undefined or null for on and later passing a value
    if (!onIsControlled && controlledOn) {
      warning(
        false,
        'A component is changing an uncontrolled Toggle of type undefined to be controlled. Toggle elements should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled Toggle element for the lifetime of the component.',
      )
    }

    // only update ourselves if on is not controlled
    if (!onIsControlled) {
      dispatch(action)
    }
    // call on change with the "new state" returned from the reducer
    // combine uncontrolled and controlled state: {...state, on}
    onChange?.(reducer({...state, on}, action), action)
  }

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
  const reset = () =>
    dispatchWithOnChange({type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({on: controlledOn, onChange}) {
  const {on, getTogglerProps} = useToggle({on: controlledOn, onChange})
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
        // onChange={(...args) =>
        //   console.info('Uncontrolled Toggle onChange', ...args)
        // }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
