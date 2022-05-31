// Modal react component for login with ICON
//
import { useEffect, useState } from "react";
import Modal from "react-modal";
import Icx from "./utils/hw-app-icx/Icx.js";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { v4 as uuidv4 } from "uuid";
import { getIcxBalance } from "../../utils/IconService.js";

import "@fontsource/lato";
import IconLogo from "./icon-logo.png";
import HanaLogo from "./hana-logo.jpg";
import LedgerLogo from "./ledger-logo.png";
import CancelLogo from "../../cancel-logo.svg";
import "./LoginModal.css";

// testing data
// import mockData from "../../../local_dev_files/mockData.js";
// const MOCK_DATA = mockData();

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
  ledger: "LEDGER"
};

const PATH = "44'/4801368'/0'/0'";

// async function getIcxBalance(address) {}

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

function getLoginDataInitState() {
  // initialize loginData
  // after user login the following set of data will be
  // passed to parent component
  return {
    selectedWallet: null,
    methodUsed: null,
    bip44Path: null,
    successfulLogin: false
  };
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
  const [ledgerDidConnect, setLedgerDidConnect] = useState(false);
  const [ledgerAddressesState, setLedgerAddressesState] = useState(null);
  const [
    indexOfLedgerAddressSelected,
    setIndexOfLedgerAddressSelected
  ] = useState(0);
  const [loginData, setLoginData] = useState(getLoginDataInitState());
  const [walletsIcxBalance, setWalletsIcxBalance] = useState(null);

  // const loginData = getLoginDataInitState();
  // const ledgerWallets = [];

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

  async function getWalletsBalance(wallets) {
    // get the ICX balance of a list of wallets
    let walletsBalance = [];
    for (const wallet of wallets) {
      let balance = await getIcxBalance(wallet.icxAddress);
      walletsBalance.push(balance);
    }
    setWalletsIcxBalance(walletsBalance);
  }

  async function handleLedgerLogin() {
    // login with ledger using webUSB method

    // open ledger modal window and show 'connecting' animation
    setLedgerModalOn(true);
    setLedgerModalIsWaiting(true);
    let ledgerWallets = [];

    const ledgerAddresses = await retrieveICONLedgerAddresses();
    // const ledgerAddresses = MOCK_DATA; // for testing purposes

    if (ledgerAddresses == null) {
      // if ledger connection failed
      setLedgerDidConnect(false);
    } else {
      // if ledger connected succesfully

      // get the balance of each wallet
      getWalletsBalance(ledgerAddresses);

      for (const wallet of ledgerAddresses) {
        ledgerWallets.push(wallet);
      }

      setLedgerAddressesState(ledgerWallets);
      setLedgerDidConnect(true);
    }
    // close 'connection animation and show ledger addresses
    setLedgerModalIsWaiting(false);
  }

  function onSelectLedgerWallet(walletIndex) {
    // user selected a ledger wallet but havent click 'cancel' or 'select' button

    // set state of selected wallet
    setIndexOfLedgerAddressSelected(walletIndex);

    // set wallet info on loginData
    let newLoginData = loginData;
    newLoginData.selectedWallet = ledgerAddressesState[walletIndex].icxAddress;
    newLoginData.bip44Path = ledgerAddressesState[walletIndex].bip44Path;
    setLoginData(newLoginData);
  }

  function handleLedgerWalletSelect() {
    // user selected a ledger wallet and clicked "select" button
    let newLoginData = loginData;
    newLoginData.methodUsed = LOGIN_METHODS.ledger;
    newLoginData.successfulLogin = true;
    setLoginData(newLoginData);

    onRetrieveData(loginData);
    closeLedgerModal();
    closeModal();
  }
  function handleLedgerWalletCancel() {
    // user selected a ledger wallet and clicked "cancel" button
    const blankLoginData = getLoginDataInitState();

    // reset login data back to initial values
    for (let label in loginData) {
      loginData[label] = blankLoginData[label];
    }
    closeLedgerModal();
  }

  useEffect(() => {
    function iconexRelayResponseEventHandler(evnt) {
      const { type, payload } = evnt.detail;
      const localLoginData = getLoginDataInitState();

      switch (type) {
        case "RESPONSE_ADDRESS":
          localLoginData.selectedWallet = payload;
          localLoginData.methodUsed = LOGIN_METHODS.iconex;
          localLoginData.successfulLogin = true;
          break;

        default:
          console.error("Error on ICONEX_RELAY_RESPONSE");
          console.error("type: " + type);
          console.error("payload: " + JSON.stringify(payload));
      }

      // send data to parent component
      setLoginData(localLoginData);
      onRetrieveData(localLoginData);
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
        ) : ledgerDidConnect ? (
          <div className="loginModal-ledgerModal">
            <div className="loginModal-ledgerModal-section">
              <div className="loginModal-ledgerModal-section-wallet">
                {ledgerAddressesState.map((wallet, index) => {
                  return (
                    <div
                      className={
                        indexOfLedgerAddressSelected === index
                          ? "loginModal-ledgerModal-section-wallet-section ledgerAddressSelected"
                          : "loginModal-ledgerModal-section-wallet-section"
                      }
                      key={uuidv4()}
                      onClick={() => onSelectLedgerWallet(index)}
                    >
                      <div className="loginModal-ledgerModal-section-wallet-index">
                        <p>{index + 1}</p>
                      </div>
                      <div className="loginModal-ledgerModal-section-wallet-content">
                        <div className="loginModal-ledgerModal-section-wallet-address">
                          <p>{wallet.icxAddress}</p>
                        </div>
                        <div className="loginModal-ledgerModal-section-wallet-balance">
                          {walletsIcxBalance == null ? (
                            <p>Balance: -.- ICX</p>
                          ) : (
                            <p>Balance: {walletsIcxBalance[index]} ICX</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="loginModal-ledgerModal-section-container-btn">
                <button onClick={handleLedgerWalletCancel}>Cancel</button>
                <button onClick={handleLedgerWalletSelect}>Select</button>
              </div>
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
