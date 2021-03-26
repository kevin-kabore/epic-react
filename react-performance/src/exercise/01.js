// Code splitting
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

// don't care about multiple imports b/c
// our bundler caches all dynnamic imports and resolved values
function loadGlobe() {
  return import('../globe')
}
// so this will already be in the cache when <Globe /> is rendered
// and our lazy import is called
const Globe = React.lazy(loadGlobe)
// const Globe = React.lazy(() => import('../globe'))

function App() {
  const [showGlobe, setShowGlobe] = React.useState(false)
  const inputRef = React.useRef()
  console.log('inputRef:', inputRef)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        padding: '2rem',
      }}
    >
      <label
        style={{marginBottom: '1rem'}}
        onMouseEnter={loadGlobe}
        onFocus={loadGlobe}
      >
        <input
          ref={inputRef}
          type="checkbox"
          checked={showGlobe}
          onChange={e => setShowGlobe(e.target.checked)}
        />
        {' show globe'}
      </label>
      <div style={{width: 400, height: 400}}>
        <React.Suspense fallback={<div>Loading...</div>}>
          {showGlobe ? <Globe /> : null}
        </React.Suspense>
      </div>
    </div>
  )
}

export default App
