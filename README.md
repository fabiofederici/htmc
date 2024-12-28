# htmc

Crypto power tools for HTML.

## Overview

htmc extends HTML with attributes for blockchain interactions. Built for developers who want to add crypto capabilities to their web applications with minimal JavaScript, following htmx's philosophy of extending HTML's native capabilities.

## Core Objectives

1. **Blockchain Agnostic**
   - Unified interface for Bitcoin, Ethereum, and Solana
   - Consistent API across different chains
   - Chain-specific implementation details abstracted away

2. **Headless Design**
   - Purely functional core library
   - UI implementation left to developers
   - Focus on logic and functionality

3. **No External Dependencies**
   - Built with native JavaScript
   - Zero npm dependencies
   - Browser standard APIs only

4. **Extensibility and Customization**
   - Plugin architecture
   - Configurable endpoints and settings
   - Easy to extend for additional chains

5. **HTMX-Like Design**
   - Familiar attribute-based API
   - HTML-first approach
   - Declarative syntax

## Installation

1. Copy configuration template:
```bash
cp config.template.js config.js
```

2. Add your RPC endpoints in config.js:
```javascript
export const NETWORKS = {
    BITCOIN: {
        mainnet: {
            name: "mainnet",
            rpcUrl: "",      // Bitcoin RPC endpoint
            exampleAddress: "",  // BTC address for testing
        }
    }
    // Add Ethereum and Solana configurations...
};
```

3. Include in your HTML:
```html
<script src="config.js" type="module"></script>
<script src="htmc.js" type="module"></script>
```

## Usage

### Declarative Interface
```html
<blockchain-wallet
    bc-chain="bitcoin"
    bc-action="get-balance"
    bc-trigger="manual"
    bc-loading="Loading..."
    bc-error="Failed to fetch balance"
    id="btc-wallet">
    <template>
        <div>
            <p>Balance: {{balance}} BTC</p>
        </div>
    </template>
</blockchain-wallet>
```

### Programmatic Interface
```javascript
import { BlockchainInterface } from './htmc.js';

const blockchain = new BlockchainInterface({
    network: 'mainnet'
});

const balance = await blockchain.bitcoin.getBalance(address);
```

## API Reference

### Custom Attributes
| Attribute | Description | Values |
|-----------|-------------|---------|
| bc-chain | Target blockchain | bitcoin, ethereum, solana |
| bc-action | Action to perform | get-balance |
| bc-trigger | Execution timing | manual, load, interval |
| bc-interval | Update frequency | Time in milliseconds |
| bc-template | Template reference | Template ID |
| bc-target | Result target | DOM selector |
| bc-loading | Loading state | HTML content |
| bc-error | Error state | HTML content |

### Configuration Structure
```javascript
// config.js structure
export const NETWORKS = {
    BITCOIN: {
        mainnet: {
            name: "mainnet",
            rpcUrl: "",      // RPC endpoint
            exampleAddress: "",  // Test address
        }
    }
};

export const API_ENDPOINTS = {
    BITCOIN: {
        GET_UTXO: (address) => `/address/${address}/utxo`,
        GET_LATEST_BLOCK: "/blocks/tip/hash"
    }
};

export const UNITS = {
    BITCOIN: {
        SATOSHI_PER_BTC: 100000000
    }
};
```

## Architecture

### Core Components
1. **Core Module**: Configuration and utilities
2. **Chain Modules**: Blockchain-specific implementations
3. **Custom Elements**: Declarative interface components

### Implementation Status

#### Completed Features
- Configuration management
- Network connections
- Balance retrieval
- Custom elements
- Declarative API
- Error handling

#### Planned Features
- Transaction support
- Smart contract interactions
- WebSocket connections
- Plugin system
- Additional custom elements

## Development

### Project Structure
```
/
├── config.template.js  # Configuration template
├── config.js           # Your local configuration (gitignored)
├── htmc.js             # Core implementation
└── index.html          # Usage example
```

### Local Development Setup

1. Create your configuration:
   ```bash
   cp config.template.js config.js
   ```
   Edit config.js to add your RPC endpoints and test addresses.

2. Start a local development server:
   ```bash
   # Using Python 3
   python3 -m http.server 3000

   # Or using Node's http-server
   npx http-server
   ```
   A local server is required because ES modules (JavaScript's import/export system)
   cannot be loaded directly from the filesystem due to browser security restrictions.

3. Access the demo:
   ```
   http://localhost:3000
   ```

### ES Modules Explained
- htmc uses modern JavaScript modules (import/export syntax)
- Requires scripts to be loaded with `type="module"`
- Must be served over HTTP(S), hence the need for a local server
```javascript
// How we use modules in htmc
import { NETWORKS } from './config.js';
export class BlockchainInterface { ... }
```

## License

MIT License

## Credits

Inspired by [htmx](https://htmx.org/) - high power tools for HTML
