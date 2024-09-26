/* eslint-disable no-unused-vars */
import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth'
import { auth as authentication } from 'firebaseui'
import React from 'react'
import { Container, createRoot } from 'react-dom/client'
import App from './App'
import { auth } from './components/connection'
import './index.css'
import reportWebVitals from './reportWebVitals'

const root = document.getElementById('root')
const rootInstance = createRoot(root as Container)
rootInstance.render(
  <div>
    <div id="firebaseui-auth-container" />
    <div id="content"> <App /> </div>
  </div>
)

const ui = new authentication.AuthUI(auth)

ui.start('#firebaseui-auth-container', {
  callbacks: {
    uiShown: function () {
      const content = document.getElementById('content')
      if (content) {
        content.style.display = 'contents'
      }
    }
  },
  signInFlow: 'popup',
  // signInSuccessUrl: '<url-to-redirect-to-on-success>',
  signInOptions: [
    {
      provider: EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false
    },
    GoogleAuthProvider.PROVIDER_ID
  ]
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
