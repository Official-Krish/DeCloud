import { type AnchorWallet } from "@solana/wallet-adapter-react";
import { BN } from "bn.js";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ADMIN_KEY, SECRET_KEY } from "@/config";
import { Contarct } from "./contract";

export const StartRentalSessionWithEscrow = async (wallet: AnchorWallet, amount: number, id: String) => {
    const program = Contarct(wallet);

    try {
        const tx = await program.methods.startRentalWithEscrow((new BN(amount * LAMPORTS_PER_SOL)), id)
        .accounts({
            payer: wallet.publicKey,
            admin: new PublicKey(ADMIN_KEY),
        })
        .rpc();
        return {
            success: true,
            signature: tx,
            message: "Rental session started successfully with escrow",
        };
    } catch (e){
        console.error("Error starting rental session with escrow", e);
        return null;
    }
}

export const TopUpEscrowSession = async (wallet: AnchorWallet, id: String, amount: number) => {
    const program = Contarct(wallet);

    try {
        const tx = await program.methods.topUpEscrow(id, new BN(amount * LAMPORTS_PER_SOL))
        .accounts({
            user: wallet.publicKey,
            admin: new PublicKey(ADMIN_KEY),
        })
        .rpc();
        return {
            success: true,
            signature: tx,
            message: "Escrow session topped up successfully",
        };
    } catch (e) {
        console.error("Error topping up escrow session", e);
        return null;
    }
}

export const FinalizeRentalWithEscrow = async (wallet: AnchorWallet, id: String, amount: number) => {
    const program = Contarct(wallet);

    try {
        const tx = await program.methods.finaliseRentalWithEscrow(id, new BN(amount * LAMPORTS_PER_SOL), SECRET_KEY)
        .accounts({
            user: wallet.publicKey,
            admin: new PublicKey(ADMIN_KEY),
        })
        .rpc();
        return {
            success: true,
            signature: tx,
            message: "Rental finalized successfully with escrow",
        };
    } catch (e) {
        console.error("Error finalizing rental with escrow", e);
        return null;
    }
}