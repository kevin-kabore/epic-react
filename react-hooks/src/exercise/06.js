// useEffect: HTTP requests
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react';
import { fetchPokemon, PokemonInfoFallback, PokemonDataView } from '../pokemon';
import { PokemonForm } from '../pokemon';

function PokemonInfo({ pokemonName }) {
  const [state, setState] = React.useState({
    status: 'idle',
    pokemon: null,
    error: null,
  });
  const { status, pokemon, error } = state;

  React.useEffect(() => {
    if (!pokemonName) return;
    setState(state => {
      return {
        ...state,
        status: 'pending',
        pokemon: null,
      };
    });

    fetchPokemon(pokemonName)
      .then(pokemonData => {
        setState(state => {
          return {
            ...state,
            pokemon: pokemonData,
            status: 'resolved',
          };
        });
      })
      .catch(error => {
        setState(state => {
          return {
            ...state,
            error,
            status: 'rejected',
          };
        });
      });
  }, [pokemonName]);

  if (status === 'idle') {
    return 'Submit a pokemon';
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />;
  } else if (status === 'rejected') {
    // this will be handled by our error boundary
    throw error;
  } else {
    // status === 'resolved'
    return <PokemonDataView pokemon={pokemon} />;
  }
}

function ErrorFallBack({ error }) {
  return (
    <div role='alert'>
      There was an error: <pre style={{ whiteSpace: 'normal' }}>{error.message}</pre>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // can report stack trace to any error service ex: sentry
    // errorInfo.componentStack
  }

  render() {
    const { error } = this.state;
    if (error) {
      return <this.props.FallBackComponent error={error} />;
    }

    return this.props.children;
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('');

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName);
  }

  return (
    <div className='pokemon-info-app'>
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className='pokemon-info'>
        <ErrorBoundary FallBackComponent={ErrorFallBack}>
          <PokemonInfo pokemonName={pokemonName} />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
