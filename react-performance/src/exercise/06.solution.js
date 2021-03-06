// Fix "perf death by a thousand cuts"
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
  updateGridState,
  updateGridCellState,
} from '../utils'

// /dog/dog-context.js
const DogContext = React.createContext()
DogContext.displayName = 'DogContext'

function dogReducer(state, action) {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return {...state, name: action.name}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}
function DogProvider(props) {
  const [name, dispatch] = React.useReducer(dogReducer, {name: ''})
  const value = [name, dispatch]
  return <DogContext.Provider value={value} {...props} />
}

function useDogState() {
  const context = React.useContext(DogContext)
  if (!context) {
    throw new Error('useDogState must be used within the DogProvider')
  }
  return context
}

// /grid/grid-context.js
const AppStateContext = React.createContext()
AppStateContext.displayName = 'AppStateContext'
const AppDispatchContext = React.createContext()
AppDispatchContext.displayName = 'AppDispatchContext'

const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
)
function appReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GRID_CELL': {
      return {...state, grid: updateGridCellState(state.grid, action)}
    }
    case 'UPDATE_GRID': {
      return {...state, grid: updateGridState(state.grid)}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function AppProvider({children}) {
  const [grid, dispatch] = React.useReducer(appReducer, {grid: initialGrid})
  return (
    <AppStateContext.Provider value={grid}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

function useAppState() {
  const context = React.useContext(AppStateContext)
  if (!context) {
    throw new Error(`useAppState must be used within a AppProvider`)
  }
  return context
}

function useGridDispatch() {
  const context = React.useContext(AppDispatchContext)
  if (!context) {
    throw new Error(`useGridDispatch must be used within a AppProvider`)
  }
  return context
}

function Grid() {
  const dispatch = useGridDispatch()
  const [rows, setRows] = useDebouncedState(50)
  const [columns, setColumns] = useDebouncedState(50)
  const updateGridData = () => dispatch({type: 'UPDATE_GRID'})
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  )
}
Grid = React.memo(Grid)

function withStateSlice(Component, stateSliceFn) {
  const ComponentMemo = React.memo(Component)
  function Wrapper(props, ref) {
    const state = useAppState()
    return (
      <ComponentMemo ref={ref} state={stateSliceFn(state, props)} {...props} />
    )
  }
  Wrapper.displayName = `withStateSlice(${
    Component.displayName || Component.name
  })`
  return React.memo(React.forwardRef(Wrapper))
}

function Cell({state: cell, row, column}) {
  const dispatch = useGridDispatch()
  const handleClick = () => dispatch({type: 'UPDATE_GRID_CELL', row, column})
  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  )
}
Cell = withStateSlice(Cell, (state, {row, column}) => state.grid[row][column])

function DogNameInput() {
  const [{name}, dispatch] = useDogState()

  function handleChange(e) {
    dispatch({type: 'TYPED_IN_DOG_INPUT', name: e.target.value})
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={name}
        onChange={handleChange}
        id="dogName"
        placeholder="Toto"
      />
      {name ? (
        <div>
          <strong>{name}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  )
}
function App() {
  const forceRerender = useForceRerender()
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <DogProvider>
          <DogNameInput />
        </DogProvider>
        <AppProvider>
          <Grid />
        </AppProvider>
      </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
