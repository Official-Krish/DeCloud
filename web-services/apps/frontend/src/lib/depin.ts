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


export async function getEarnedSOL(machineId: string, userPublicKey: PublicKey, wallet: AnchorWallet) {
    const program = Contarct(wallet);
    const [pda, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from("host_machine"), userPublicKey.toBuffer(), Buffer.from(machineId)],
        program.programId
    );
    const accountInfo = await program.provider.connection.getAccountInfo(pda);
    if (!accountInfo) {
        throw new Error("Account not found");
    }
    return Number(accountInfo.data.readBigUInt64LE(0) / BigInt(1e9));
}