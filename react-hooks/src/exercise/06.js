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

  console.log('state:', state);
  if (state.status === 'idle') {
    return 'Submit a pokemon';
  } else if (state.status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />;
  } else if (state.status === 'rejected') {
    throw state.error;
  } else {
    // status === 'resolved'
    return <PokemonDataView pokemon={state.pokemon} />;
  }
}

class ErrorBoundary extends React.Component {
  state = { error: null, errorInfo: null };

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // can report to any error service like sentry
  }
  render() {
    if (this.state.errorInfo) {
      return (
        <React.Fragment>
          {this.state.error && (
            <div role='alert'>
              There was an error: <pre style={{ whiteSpace: 'normal' }}>{this.state.error.message}</pre>
            </div>
          )}
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </React.Fragment>
      );
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
        <ErrorBoundary>
          <PokemonInfo pokemonName={pokemonName} />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
