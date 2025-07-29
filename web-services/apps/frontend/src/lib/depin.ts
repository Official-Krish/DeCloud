import { type AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ADMIN_KEY, SECRET_KEY } from "@/config";
import { Contarct } from "./contract";

export const claimSolana = async (wallet: AnchorWallet, id: String) => {
    try {
        const program = Contarct(wallet);
        const txn = await program.methods.claimRewards(id, SECRET_KEY)
            .accounts({
                admin: new PublicKey(ADMIN_KEY),
                host: wallet.publicKey,
            })
            .rpc();
            return {
                success: true,
                signature: txn,
                message: "Claim successful"
            };
    } catch (error) {
        console.error("Error claiming Solana:", error);
        throw error;
    }
}