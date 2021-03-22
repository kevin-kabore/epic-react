import * as React from 'react'
// 🐨 create your CountContext here with React.createContext
const CountContext = React.createContext()

function useCount() {
  const context = React.useContext(CountContext)

  if (!context) {
    throw new Error('useCount must be used within a CountProvider')
  }

  return context
}

// 🐨 create a CountProvider component here that does this:
function CountProvider(props) {
  //   🐨 get the count state and setCount updater with React.useState
  const [count, setCount] = React.useState(0)
  //   🐨 create a `value` array with count and setCount
  const value = [count, setCount]
  //   🐨 return your context provider with the value assigned to that array and forward all the other props
  //   💰 more specifically, we need the children prop forwarded to the context provider
  return <CountContext.Provider value={value} {...props} />
}

export {useCount, CountProvider}
