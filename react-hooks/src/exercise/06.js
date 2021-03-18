// useEffect: HTTP requests
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
// 🐨 you'll want the following additional things from '../pokemon':
import { fetchPokemon, PokemonInfoFallback, PokemonDataView } from '../pokemon'
// fetchPokemon: the function we call to get the pokemon info
// PokemonInfoFallback: the thing we show while we're loading the pokemon info
// PokemonDataView: the stuff we use to display the pokemon info
import { PokemonForm } from '../pokemon'

function PokemonInfo({ pokemonName }) {
  // 🐨 Have state for the pokemon (null)
  const [pokemon, setPokemon] = React.useState(null)
  const [error, setError] = React.useState(null)
  // 🐨 use React.useEffect where the callback should be called whenever the
  // pokemon name changes.
  React.useEffect(() => {
    if (!pokemonName) return
    // 🐨 before calling `fetchPokemon`, clear the current pokemon state by setting it to null
    setPokemon(null)

    fetchPokemon(pokemonName)
      .then(pokemonData => setPokemon(pokemonData))
      .catch(error => setError(error))
  }, [pokemonName])

  if (!pokemonName) {
    return 'Submit a pokemon'
  }

  if (pokemonName && !pokemon) {
    return (
      <React.Fragment>
        {error ? (
          <div role='alert'>
            There was an error: <pre style={{ whiteSpace: 'normal' }}>{error.message}</pre>
          </div>
        ) : (
          <PokemonInfoFallback name={pokemonName} />
        )}
      </React.Fragment>
    )
  }

  return <PokemonDataView pokemon={pokemon} />
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  return (
    <div className='pokemon-info-app'>
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className='pokemon-info'>
        <PokemonInfo pokemonName={pokemonName} />
      </div>
    </div>
  )
}

export default App
