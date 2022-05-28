import { useState } from "react";
import LoginModal from "./components/LoginModal/LoginModal.js";

import "./App.css";

function App() {
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);

  function handleLogin() {
    // login with ICON
    setLoginModalIsOpen(true);
  }

  function closeLoginModal(dataFromModal) {
    // this function handles the closing of the LoginModal
    // dataFromModal is the login data passed from the component
    // to the parent after the login process
    setLoginModalIsOpen(false);
    console.log(dataFromModal);
  }
  return (
    <div className="App">
      <header className="App-header">
        <p>Login with ICON</p>
        <button className="App-button-login" onClick={handleLogin}>
          <p>Log in</p>
        </button>
        <LoginModal
          isOpen={loginModalIsOpen}
          onRequestClose={closeLoginModal}
        />
      </header>
    </div>
  );
}

export default App;
