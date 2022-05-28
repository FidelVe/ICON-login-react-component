import { useState } from "react";
import Modal from "react-modal";
import "./LoginModal.css";

// for accesibility purposes
Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

function LoginModal(props) {
  // Modal window for login with ICON.
  // This is a stateless component, the OPEN/CLOSE state is
  // controlled by the parent state
  //
  // props = {
  // isOpen: bool // default is false
  // onRequestClose: callback to change modal state to close on parent component
  // }
  //
  const loginData = {
    // after user login the following set of data will be
    // passed to parent component
    selectedWallet: null
  };
  function closeModal() {
    props.onRequestClose(loginData);
  }
  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Login with ICON"
    >
      <button onClick={closeModal}>Close</button>
    </Modal>
  );
}

export default LoginModal;
