import './styles/index.css'

import { BrowserRouter } from 'react-router-dom'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-client-preset'
import { ApolloProvider } from 'react-apollo'
import App from './components/App'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import React from 'react'
import ReactDOM from 'react-dom'

import { AUTH_TOKEN } from './constants'
import registerServiceWorker from './registerServiceWorker'

const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  const authorizationHeader = token ? `Bearer ${token}` : null
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  })
  return forward(operation)
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

const client = new ApolloClient({
  link: middlewareAuthLink.concat(httpLink),
  cache: new InMemoryCache()
})

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root'),
)

registerServiceWorker()
