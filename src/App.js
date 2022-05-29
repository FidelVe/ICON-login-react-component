import { useState } from "react";
import LoginModal from "./components/LoginModal/LoginModal.js";

import "./App.css";
import IconLogo from "./icon-logo.png";

function App() {
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [loginData, setLoginData] = useState("");
  // loginData: {
  //   selectedWallet: 'hx93940...',
  //     methodUsed: 'ICONEX' | 'LEDGER1',
  //     successfulLogin: bool
  // }

  function handleLogin() {
    // login with ICON
    setLoginModalIsOpen(true);
  }

  function closeLoginModal() {
    // this function handles the closing of the LoginModal
    // dataFromModal is the login data passed from the component
    // to the parent after the login process
    setLoginModalIsOpen(false);
  }

  function getDataFromLoginModal(loginData) {
    // Callback function that gets called from within LoginModal
    // to pass login data into parent
    setLoginData(loginData);
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={IconLogo} className="App-logo" alt="icon logo" />
        <h2>Login with ICON</h2>
        <button className="App-button-login" onClick={handleLogin}>
          <p>Log in</p>
        </button>
        <LoginModal
          isOpen={loginModalIsOpen}
          onRequestClose={closeLoginModal}
          onRetrieveData={getDataFromLoginModal}
        />
        <p>Login data: {JSON.stringify(loginData)}</p>
      </header>
    </div>
  );
}

export default App;
