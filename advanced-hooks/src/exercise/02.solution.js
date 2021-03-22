// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

// 🐨 this is going to be our generic asyncReducer
function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

const makeCancellable = promise => {
  let isCancelled = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      data => (isCancelled ? reject({isCancelled: true}) : resolve(data)),
      err => (isCancelled ? reject({isCancelled: true}) : reject(err)),
    )
  })

  return {
    promise: wrappedPromise,
    cancel: () => {
      isCancelled = true
    },
  }
}

// eslint-disable-next-line no-unused-vars
function useCancellableAsync(initialState) {
  const promiseRef = React.useRef(null)

  const [state, dispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  })

  const run = React.useCallback(promise => {
    promiseRef.current = promiseRef.current || makeCancellable(promise)
    dispatch({type: 'pending'})
    promiseRef.current.promise
      .then(data => {
        dispatch({type: 'resolved', data})
      })
      .catch(error => {
        if (error.isCancelled) return
        dispatch({type: 'rejected', error})
      })
  }, [])

  React.useEffect(() => {
    if (!promiseRef.current) return
    return () => {
      promiseRef.current.cancel()
      promiseRef.current = null
    }
  }, [])

  return {...state, run}
}

function useSafeDispatch(dispatch) {
  const mountedRef = React.useRef(false)

  React.useLayoutEffect(() => {
    mountedRef.current = true
    return () => (mountedRef.current = false)
  }, [])

  return React.useCallback(
    (...args) => {
      if (!mountedRef.current) return
      dispatch(...args)
    },
    [dispatch],
  )
}

const useAsync = initialState => {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  })

  const dispatch = useSafeDispatch(unsafeDispatch)

  const run = React.useCallback(
    promise => {
      dispatch({type: 'pending'})
      promise
        .then(data => {
          dispatch({type: 'resolved', data})
        })
        .catch(error => {
          dispatch({type: 'rejected', error})
        })
    },
    [dispatch],
  )

  return {...state, run}
}

function PokemonInfo({pokemonName}) {
  const state = useAsync({status: pokemonName ? 'pending' : 'idle'})

  const {data: pokemon, status, error, run} = state

  React.useEffect(() => {
    if (!pokemonName) return
    run(fetchPokemon(pokemonName))
  }, [run, pokemonName])

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
