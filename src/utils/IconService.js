// wrapper for the icon-sdk-js
//
import IconService from "icon-sdk-js";

const API_NODE_LIST = {
  geometry: "api.icon.geometry.io",
  ctz: "ctz.solidwallet.io"
};

const API_NODE = "https://" + API_NODE_LIST.geometry + "/api/v3";
const httpProvider = new IconService.HttpProvider(API_NODE);
const iconService = new IconService(httpProvider);

function convertLoopToIcx(value) {
  return IconService.IconConverter.toBigNumber(
    IconService.IconAmount.of(
      value,
      IconService.IconAmount.Unit.LOOP
    ).convertUnit(IconService.IconAmount.Unit.ICX)
  );
}
async function getIcxBalance(address, decimals = 2) {
  // get icx balance of address
  const balanceInLoop = await iconService.getBalance(address).execute();
  const balanceInIcx = convertLoopToIcx(balanceInLoop);
  return balanceInIcx.toFixed(decimals);
}

export { getIcxBalance };
