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

const AppStateContext = React.createContext()
AppStateContext.displayName = 'AppStateContext'
const AppDispatchContext = React.createContext()
AppDispatchContext.displayName = 'AppDispatchContext'

const DogNameContext = React.createContext()
DogNameContext.displayName = 'DogNameContext'

const GridStateContext = React.createContext()
GridStateContext.displayName = 'GridStateContext'
const GridDispatchContext = React.createContext()
GridDispatchContext.displayName = 'GridDispatchContext'

function DogNameProvider({children}) {
  const [name, setName] = React.useState('')
  return (
    <DogNameContext.Provider value={[name, setName]}>
      {children}
    </DogNameContext.Provider>
  )
}

function useDogName() {
  const context = React.useContext(DogNameContext)
  if (!context) {
    throw new Error('useDogName must be used within the DogNameProvider')
  }
  return context
}

// /grid/grid-context.js
const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
)
function gridReducer(state, action) {
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

function GridProvider({children}) {
  const [grid, dispatch] = React.useReducer(gridReducer, {grid: initialGrid})
  return (
    <GridStateContext.Provider value={grid}>
      <GridDispatchContext.Provider value={dispatch}>
        {children}
      </GridDispatchContext.Provider>
    </GridStateContext.Provider>
  )
}

function useGridState() {
  const context = React.useContext(GridStateContext)
  if (!context) {
    throw new Error(`useGridState must be used within a GridProvider`)
  }
  return context
}

function useGridDispatch() {
  const context = React.useContext(GridDispatchContext)
  if (!context) {
    throw new Error(`useGridDispatch must be used within a GridProvider`)
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

function Cell({row, column}) {
  const state = useGridState()
  const cell = state.grid[row][column]
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
Cell = React.memo(Cell)

function DogNameInput() {
  const [name, setName] = useDogName()

  function handleChange(e) {
    setName(e.target.value)
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
        <DogNameProvider>
          <DogNameInput />
        </DogNameProvider>
        <GridProvider>
          <Grid />
        </GridProvider>
      </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
