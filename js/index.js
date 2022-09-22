
const VINCI_ENV = sessionStorage.getItem('vinciEnv');
const BASE_URL = VINCI_ENV === 'dev' ? 'http://localhost:5001/vinci-dev-6e577/us-central1/api/public' :
    'https://us-central1-vinci-dev-6e577.cloudfunctions.net/api/public';
const PROJECT_ID = 'teste-e40fae4e-e910-4905-b21d-7'
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

const fetchUsers = () => {
    console.log(window.location.href.split('/')[window.location.href.split('/').length - 1]);
    console.log(window.location.href);
    axios.get(BASE_URL, {
        params: {
            url: window.location.href,
            API_KEY: 'VINCI_DEV_6E577'
        }, headers: { "Access-Control-Allow-Origin": "*" }
    })
        .then(response => {
            const users = response.data.data;
        })
        .catch(error => console.error(error));
};

const logPageView = () => {
    if (PROJECT_ID === "{{projectId}}") return;
    axios.post(BASE_URL + '/onboardingview', {
        projectId: PROJECT_ID,
        requestURL: window.location.href,
        API_KEY: 'VINCI_DEV_6E577'
    });
}

/**
 * Setup the orchestra
 */
function init() {
    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: "7550f76d68824553876499772c39974a",
            }
        },
    };
    web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
        disableInjectedProvider: false
    });
    console.log("Web3Modal instance is", web3Modal);
}

function getProvider() {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;
  
      if (provider?.isPhantom) {
        return provider;
      }
    }
    window.open("https://phantom.app/", "_blank");
  }
/**
 * Connect wallet button pressed.
 */
async function onConnect() {
    const provider = getProvider();
    try {
      provider.connect().then((resp) => {
        console.log(resp.publicKey.toString());
        connectButton.innerHTML = window.solana.publicKey;
        console.log(provider);
        status.innerHTML = provider.isConnected.toString();
      });
    } catch (err) {
      console.log(err);
    }
    

    console.log("Opening a dialog", web3Modal);
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
    // Get a Web3 instance for the wallet
    const web3 = new Web3(provider);
    console.log("Web3 instance is", web3);
    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    // Load chain information over an HTTP API
    const chainData = evmChains.getChain(chainId);
    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();
    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];
    await Promise.all(rowResolvers);
    document.querySelector("#connected").style.display = "block";
}

logPageView();

/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
    init();
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
});