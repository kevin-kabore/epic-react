import * as React from 'react'

const PokemonCacheContext = React.createContext()

function PokemonCacheProvider(props) {
  const [cache, dispatch] = React.useReducer(pokemonCacheReducer, {})
  return <PokemonCacheContext.Provider value={[cache, dispatch]} {...props} />
}

function usePokemonCache() {
  const context = React.useContext(PokemonCacheContext)
  if (!context) {
    throw new Error(
      `usePokemonCache() must be used within a PokemonCacheProvider.`,
    )
  }
  return context
}

function pokemonCacheReducer(state, action) {
  switch (action.type) {
    case 'ADD_POKEMON': {
      return {...state, [action.pokemonName]: action.pokemonData}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

export {PokemonCacheProvider, usePokemonCache}
