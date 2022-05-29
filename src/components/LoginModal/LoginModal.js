// Modal react component for login with ICON
//
import { useEffect, useState } from "react";
import Modal from "react-modal";
import "./LoginModal.css";
import IconLogo from "./icon-logo.png";
import HanaLogo from "./hana-logo.jpg";
import LedgerLogo from "./ledger-logo.png";
import Icx from "./utils/hw-app-icx/Icx.js";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import CancelLogo from "../../cancel-logo.svg";

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
const LOGIN_METHODS = {
  iconex: "ICONEX",
  ledger1: "LEDGER1",
  ledger2: "LEDGER2"
};

const PATH = "44'/4801368'/0'/0'";

async function retrieveICONLedgerAddresses(count = 20) {
  // connects to a ledger device and retrieve a set amount of ICON
  // addresses (count)
  let addressesData = [
    // {
    //   bip44Path: "44'/4801368'/0'/0'/n'" // bip44 path of the address
    //   icxAddress: 'hx49394...' // ICX address for the corresponding bip44path
    // }
  ];
  try {
    // connects to ledger device via webhid
    const transport = await TransportWebHID.create();

    const appIcx = new Icx(transport);
    for (let i = 0; i < count; i++) {
      let currentPath = PATH + `/${i.toString()}'`;
      const icxAddress = await appIcx.getAddress(currentPath, false, true);

      addressesData.push({
        bip44Path: currentPath,
        icxAddress: icxAddress.address.toString()
      });
    }

    return addressesData;
  } catch (err) {
    // handles error
    console.log("error: ");
    console.log(err);
    return null;
  }
}

function LoginModal({ onRequestClose, onRetrieveData, isOpen, ...props }) {
  // Modal window for login with ICON.
  // This is a stateless component, the OPEN/CLOSE state is
  // controlled by the parent state
  //
  // props = {
  // onRetrieveData:
  // isOpen: bool // default is false
  // onRequestClose: callback to change modal state to close on parent component
  // }
  //
  const [ledgerModalOn, setLedgerModalOn] = useState(false);
  const [ledgerModalIsWaiting, setLedgerModalIsWaiting] = useState(true);
  const loginData = {
    // after user login the following set of data will be
    // passed to parent component
    selectedWallet: null,
    methodUsed: null,
    successfulLogin: false
  };

  function closeLedgerModal() {
    setLedgerModalOn(false);
  }

  function closeModal() {
    // send signal to close LoginModal
    onRequestClose();
  }

  function handleIconLogin() {
    // login with ICONex or Hana wallets
    window.dispatchEvent(
      new CustomEvent("ICONEX_RELAY_REQUEST", {
        detail: {
          type: "REQUEST_ADDRESS"
        }
      })
    );
  }

  async function handleLedgerLogin() {
    // login with ledger using webUSB method

    // open ledger modal window and show 'connecting' animation
    setLedgerModalOn(true);
    setLedgerModalIsWaiting(true);

    const ledgerAddresses = await retrieveICONLedgerAddresses();
    console.log(ledgerAddresses);

    // close 'connection animation and show ledger addresses
    setLedgerModalIsWaiting(false);
  }

  useEffect(() => {
    function iconexRelayResponseEventHandler(evnt) {
      const { type, payload } = evnt.detail;

      switch (type) {
        case "RESPONSE_ADDRESS":
          loginData.selectedWallet = payload;
          loginData.methodUsed = LOGIN_METHODS.iconex;
          loginData.successfulLogin = true;
          break;

        default:
          console.error("Error on ICONEX_RELAY_RESPONSE");
          console.error("type: " + type);
          console.error("payload: " + JSON.stringify(payload));
      }

      // send data to parent component
      onRetrieveData(loginData);
      // close LoginModal
      closeModal();
    }
    window.addEventListener(
      "ICONEX_RELAY_RESPONSE",
      iconexRelayResponseEventHandler
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      // isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Login with ICON"
    >
      <div className="LoginModal-main">
        <div className="LoginModal-title">
          <h2>Login with ICON</h2>
        </div>
        <div className="LoginModal-body">
          <div className="LoginModal-body-section" onClick={handleIconLogin}>
            <div className="LoginModal-body-section-item">
              <p>Login using ICONex | Hana wallet</p>
            </div>
            <div className="LoginModal-body-section-item">
              <span className="LoginModal-body-section-item-img">
                <img alt="" src={IconLogo} />
              </span>
              <span className="LoginModal-body-section-item-img">
                <img alt="" src={HanaLogo} />
              </span>
            </div>
          </div>
          <hr />
          <div className="LoginModal-body-section" onClick={handleLedgerLogin}>
            <div className="LoginModal-body-section-item">
              <p>Login using Ledger</p>
            </div>
            <div className="LoginModal-body-section-item">
              <span className="LoginModal-body-section-item-img">
                <img alt="" src={LedgerLogo} />
              </span>
            </div>
          </div>
          <hr />
          <div className="LoginModal-body-section">
            <div className="LoginModal-body-section-item">
              <p>Login using Ledger - U2F</p>
            </div>
            <div className="LoginModal-body-section-item">
              <span className="LoginModal-body-section-item-img">
                <img alt="" src={LedgerLogo} />
              </span>
            </div>
          </div>
        </div>
        <div className="LoginModal-footer"></div>
      </div>
      {/* <button onClick={closeModal}>Close</button> */}
      <Modal
        isOpen={ledgerModalOn}
        onRequestClose={closeLedgerModal}
        style={customStyles}
      >
        {" "}
        {ledgerModalIsWaiting ? (
          <div className="loginModal-ledgerModal">
            <div className="loginModal-ledgerModal-section">
              <img
                src={IconLogo}
                className="loginModal-ledgerModal-logo"
                alt="icon logo"
              />
              <p>Connecting to ledger...</p>
            </div>
          </div>
        ) : (
          <div className="loginModal-ledgerModal">
            <div className="loginModal-ledgerModal-section">
              <img
                src={CancelLogo}
                className="loginModal-ledgerModal-logo"
                alt="icon logo"
              />
              <p>
                Failed to connect Ledger, try refreshing the page and/or
                reconnecting device.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </Modal>
  );
}

export default LoginModal;
