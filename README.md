# ☁️ DeCloud (v1) — Decentralized Cloud Compute with Solana

**DeCloud** is a decentralized platform where users can **rent cloud virtual machines** (e.g., EC2 or GCP instances) by paying with **SOL**.  
In this version (v1), users **prepay** for compute time, and the platform provisions cloud instances accordingly.

## 🚀 Upcoming in v2

In version 2 (v2), the platform will introduce a **real-time usage-based payment system**.  
Key changes include:

- **Dynamic Escrow Contract**: Users will pay for compute time based on their **real-time usage** instead of prepaying.
- **Enhanced Session Tracking**: Improved on-chain tracking for accurate billing and refunds.
- **Seamless User Experience**: Automatic fund adjustments during active sessions.

## 📦 Monorepo Structure

DeCloud/
├── contract/ # Solana smart contract (Anchor)
├── web-services/ # App services (API and frontend)
│ ├── apps/
│ │ ├── backend/ # bun-based backend
│ │ └── frontend/ # React frontend
│ └── packages/ # Databse, Shared code, utils, or SDK



## 🔐 Smart Contract (Anchor)
| Function | Description |
|----------|-------------|
| `initialize_vault` | Sets up a vault account for the admin |
| `transfer_to_vault_and_rent` | Transfers SOL from user to vault and Starts a rental session with user, amount, and duration|
| `transfer_from_vault` | Ends session and settles payment |
| `end_rental_session` | Ends session when time is completed |

## 🌐 Web Services

### Backend (`web-services/apps/backend`)
- Handles:
  - User authentication
  - GCP/EC2 provisioning 
  - Track actual usage off-chain
  - Finalize sessions (trigger smart contract to release funds)
- Tech: `Bun`, WebSockets

### Frontend (`web-services/apps/frontend`)
- Users:
  - Connect wallet
  - Select machine specs and rental time
  - Pay SOL for usage
- Tech: `React`, `TailwindCSS`, `shadcn/ui`, etc.

---

## 💻 Getting Started

# Anchor Setup
```bash
cd contract
anchor build
anchor deploy
```

# Backend
```bash
cd web-services/apps/backend
bun install
bun dev
```

# frontend
```bash 
cd web-services/apps/frontend
bun install
bun dev  
```

# Database
```bash 
cd web-services/packages/db
bun install
bun prisma migrate dev  
```

## 🧪 Flow (v1 – Prepaid Billing)
User connects wallet

User selects VM specs + duration

App calculates total SOL cost (duration × rate)

User signs and transfers to vault

Session starts + VM is provisioned off-chain

VM auto-terminates after start_time + duration

## 🚧 v2 Roadmap (Upcoming)
✅ Flexible Escrow: Lock max amount, charge per actual usage

🔁 Usage-Based Billing: Stream billing per second/minute

📈 Real-time Usage Tracking: CPU/RAM/network metrics


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please email Krishanand974@gmail.com.

## ✨ Credits
Built with Solana + Anchor

Powered by TurboRepo

Cloud provisioned via GCP


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.