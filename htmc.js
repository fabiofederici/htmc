import { NETWORKS, API_ENDPOINTS, UNITS, ERROR_MESSAGES } from "./config.js";

class BitcoinModule {
  constructor(core) {
    this.core = core;
    this.network = core.config.network;
    this.config = NETWORKS.BITCOIN[this.network];
  }

  async connect() {
    try {
      const response = await fetch(`${this.config.rpcUrl}/blocks/tip/height`);
      if (!response.ok)
        throw new Error(ERROR_MESSAGES.CONNECTION_FAILED("Bitcoin"));
      return true;
    } catch (error) {
      console.error("Bitcoin connection error:", error);
      throw new Error(ERROR_MESSAGES.CONNECTION_FAILED("Bitcoin"));
    }
  }

  async getBalance(address) {
    try {
      if (!address) throw new Error(ERROR_MESSAGES.ADDRESS_REQUIRED);

      const response = await fetch(
        `${this.config.rpcUrl}${API_ENDPOINTS.BITCOIN.GET_UTXO(address)}`,
      );
      if (!response.ok)
        throw new Error(ERROR_MESSAGES.FETCH_BALANCE_FAILED("Bitcoin"));

      const utxos = await response.json();
      const balance = utxos.reduce((sum, utxo) => sum + (utxo.value || 0), 0);

      return balance / UNITS.BITCOIN.SATOSHI_PER_BTC;
    } catch (error) {
      console.error("Bitcoin balance error:", error);
      throw error;
    }
  }
}

class EthereumModule {
  constructor(core) {
    this.core = core;
    this.network = core.config.network;
    this.config = NETWORKS.ETHEREUM[this.network];
  }

  async connect() {
    try {
      const response = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_blockNumber",
          params: [],
        }),
      });
      if (!response.ok)
        throw new Error(ERROR_MESSAGES.CONNECTION_FAILED("Ethereum"));
      return true;
    } catch (error) {
      console.error("Ethereum connection error:", error);
      throw new Error(ERROR_MESSAGES.CONNECTION_FAILED("Ethereum"));
    }
  }

  async getBalance(address) {
    try {
      if (!address) throw new Error(ERROR_MESSAGES.ADDRESS_REQUIRED);

      const response = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"],
        }),
      });

      if (!response.ok)
        throw new Error(ERROR_MESSAGES.FETCH_BALANCE_FAILED("Ethereum"));

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const balanceWei = parseInt(data.result, 16);
      return balanceWei / UNITS.ETHEREUM.WEI_PER_ETH;
    } catch (error) {
      console.error("Ethereum balance error:", error);
      throw error;
    }
  }
}

class SolanaModule {
  constructor(core) {
    this.core = core;
    this.network = core.config.network;
    this.config = NETWORKS.SOLANA[this.network];
  }

  async connect() {
    try {
      const response = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getHealth",
        }),
      });

      const data = await response.json();
      if (data.error || !response.ok) {
        throw new Error(ERROR_MESSAGES.CONNECTION_FAILED("Solana"));
      }
      return true;
    } catch (error) {
      console.error("Solana connection error:", error);
      throw new Error(ERROR_MESSAGES.CONNECTION_FAILED("Solana"));
    }
  }

  async getBalance(address) {
    try {
      if (!address) throw new Error(ERROR_MESSAGES.ADDRESS_REQUIRED);

      const response = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address],
        }),
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.FETCH_BALANCE_FAILED("Solana"));
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(
          data.error.message || ERROR_MESSAGES.INVALID_ADDRESS("Solana"),
        );
      }

      return data.result.value / UNITS.SOLANA.LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Solana balance error:", error);
      throw error;
    }
  }
}

class BlockchainInterface {
  constructor(config = {}) {
    this.core = { config: { network: "mainnet", ...config } };
    this.bitcoin = new BitcoinModule(this.core);
    this.ethereum = new EthereumModule(this.core);
    this.solana = new SolanaModule(this.core);
  }

  async initializeChain(chain) {
    console.log(`Initializing ${chain} connection...`);
    switch (chain) {
      case "bitcoin":
        return await this.bitcoin.connect();
      case "ethereum":
        return await this.ethereum.connect();
      case "solana":
        return await this.solana.connect();
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }
}

class BlockchainWallet extends HTMLElement {
  static get observedAttributes() {
    return [
      "bc-chain",
      "bc-address",
      "bc-action",
      "bc-trigger",
      "bc-interval",
      "bc-target",
      "bc-template",
      "bc-loading",
      "bc-error",
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._loading = false;
    this.blockchain = new BlockchainInterface();
    this._setupEventHandlers();
  }

  static checkBalance(elementId) {
    const wallet = document.getElementById(elementId);
    const input = document.getElementById(`${elementId}-input`);
    if (wallet && input) {
      wallet.setAttribute("bc-address", input.value);
    }
  }

  static initializeAddresses() {
    document.querySelectorAll("blockchain-wallet").forEach((wallet) => {
      const chain = wallet.getAttribute("bc-chain");
      const inputId = `${wallet.id}-input`;
      const input = document.getElementById(inputId);
      if (input && chain) {
        const network = NETWORKS[chain.toUpperCase()]?.mainnet;
        if (network?.exampleAddress) {
          input.value = network.exampleAddress;
        }
      }
    });
  }

  _setupEventHandlers() {
    const trigger = this.getAttribute("bc-trigger") || "load";

    if (trigger === "load") {
      this._initializeOnLoad();
    } else if (trigger === "interval") {
      this._initializeWithInterval();
    }
  }

  async _initializeOnLoad() {
    const address = this.getAttribute("bc-address");
    if (address) {
      await this.executeAction();
    }
  }

  _initializeWithInterval() {
    const interval = parseInt(this.getAttribute("bc-interval")) || 30000;
    this._intervalId = setInterval(async () => {
      await this.executeAction();
    }, interval);
  }

  async executeAction() {
    const action = this.getAttribute("bc-action") || "get-balance";
    const chain = this.getAttribute("bc-chain");
    const address = this.getAttribute("bc-address");

    if (!chain || !address) return;

    try {
      this._setLoading(true);

      let result;
      switch (action) {
        case "get-balance":
          result = await this._getBalance(chain, address);
          break;
        default:
          throw new Error(`Unsupported action: ${action}`);
      }

      this._updateUI(result);
    } catch (error) {
      this._handleError(error);
    } finally {
      this._setLoading(false);
    }
  }

  _setLoading(isLoading) {
    this._loading = isLoading;
    if (isLoading) {
      const loadingContent = this.getAttribute("bc-loading") || "Loading...";
      this.shadowRoot.innerHTML = `<div>${loadingContent}</div>`;
    }
  }

  _handleError(error) {
    const errorContent =
      this.getAttribute("bc-error") || `Error: ${error.message}`;
    this.shadowRoot.innerHTML = `<div style="color: red;">${errorContent}</div>`;
  }

  async _getBalance(chain, address) {
    await this.blockchain.initializeChain(chain);

    switch (chain) {
      case "bitcoin":
        return await this.blockchain.bitcoin.getBalance(address);
      case "ethereum":
        return await this.blockchain.ethereum.getBalance(address);
      case "solana":
        return await this.blockchain.solana.getBalance(address);
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  _updateUI(result) {
    const templateId = this.getAttribute("bc-template");
    let content;

    if (templateId) {
      const template = document.getElementById(templateId);
      if (template) {
        content = template.innerHTML.replace("{{balance}}", result.toFixed(8));
      } else {
        const innerTemplate = this.querySelector("template");
        content = innerTemplate
          ? innerTemplate.innerHTML.replace("{{balance}}", result.toFixed(8))
          : result.toFixed(8);
      }
    } else {
      const innerTemplate = this.querySelector("template");
      content = innerTemplate
        ? innerTemplate.innerHTML.replace("{{balance}}", result.toFixed(8))
        : result.toFixed(8);
    }

    const target = this.getAttribute("bc-target");
    if (target) {
      const targetElement = document.querySelector(target);
      if (targetElement) {
        targetElement.innerHTML = content;
      }
    } else {
      this.shadowRoot.innerHTML = content;
    }
  }

  disconnectedCallback() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (
      (name === "bc-address" || name === "bc-chain") &&
      !this._loading &&
      this.getAttribute("bc-trigger") !== "interval"
    ) {
      this.executeAction();
    }
  }
}

if (!customElements.get("blockchain-wallet")) {
  customElements.define("blockchain-wallet", BlockchainWallet);
}

export { BlockchainInterface, BlockchainWallet };
