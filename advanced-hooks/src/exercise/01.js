// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react';
const countReducer = (state, action) => ({
  ...state, // always spread the state
  ...(typeof action === 'function' ? action(action) : action),
})
  typeof action === 'function' ? action(state) : ({ ...state, ...action });

function Counter({ initialCount = 0, step = 1 }) {
  const [state, setState] = React.useReducer(countReducer, {
    count: initialCount,
  });
  const {count} = state
  const increment = () => setState((currentState) => ({ count: currentState.count + step }));
  return <button onClick={increment}>{count}</button>;
}

function App() {
  return <Counter />;
}

export default App;
