import { clusterApiUrl, Connection } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from '../../idl/contract.json';
import { type AnchorWallet } from "@solana/wallet-adapter-react";
import { BN } from "bn.js";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ADMIN_KEY, SECRET_KEY } from "@/config";

const network = clusterApiUrl('devnet');

function Contarct(wallet: AnchorWallet): Program {
    if (!wallet) {
        throw new Error("Wallet not connected");
    }
    const connection = new Connection(network);
    const provider = new AnchorProvider(connection, wallet, {});

    const program = new Program(idl as any, provider);
    
    return program;
}
 

export const InitiatesVaultAccount = async (wallet: AnchorWallet, secretKey: string) => {
    const program = Contarct(wallet);
  
    if (!wallet) {
      console.error("Wallet not connected");
      return null;
    }
  
    try {
        const tx = await program.methods.initializeVault(secretKey).accounts({
            admin: wallet.publicKey,
        })
        .rpc();
        return {
            success: true,
            signature: tx,
            message: "Vault account initialized successfully",
        };
    } catch (error) {
      console.error("Error fetching stake account", error);
      return null;
    }
};

export const FundVaultAccount = async (wallet: AnchorWallet, amount: number, secretKey: string) => {
    const program = Contarct(wallet);
  
    if (!wallet) {
      console.error("Wallet not connected");
      return null;
    }
  
    try {
        const tx = await program.methods.fundVault(new BN(amount * LAMPORTS_PER_SOL), secretKey).accounts({
            admin: wallet.publicKey,
        })
        .rpc();
        const vaultAccount = await PublicKey.findProgramAddress(
            [Buffer.from("vault_account"), wallet.publicKey.toBuffer(), Buffer.from(secretKey)],
            program.programId
        );
        const vaultAccountBalance = await program.provider.connection.getBalance(vaultAccount[0]);
        return {
            success: true,
            signature: tx,
            message: "Vault account funded successfully",
            balance: vaultAccountBalance / LAMPORTS_PER_SOL,
        };
    } catch (error) {
      console.error("Error funding vault account", error);
      return null;
    }
}

export const transferFromVault = async (amount: number, id: String, wallet: AnchorWallet) => {
    const program = Contarct(wallet);
  
    if (!wallet) {
      console.error("Wallet not connected");
      return null;
    }
  
    try {
        const tx = program.methods.transferFromVault(new BN(amount * LAMPORTS_PER_SOL), id, SECRET_KEY)
            .accounts({
                admin: new PublicKey(ADMIN_KEY),
                payer: wallet.publicKey,
            })
            .rpc();
        return {
            success: true,
            signature: tx,
            message: "Funds transferred from vault account successfully",
        };
    } catch (error) {
      console.error("Error transferring funds from vault account", error);
      return null;
    }
}

export const EndRentalSession = async (id: String, wallet: AnchorWallet) => {
    const program = Contarct(wallet);
  
    if (!wallet) {
      console.error("Wallet not connected");
      return null;
    }
  
    try {
        const tx = await program.methods.endRentalSession(id).accounts({
            payer: wallet.publicKey,
        })
        .rpc();
        return {
            success: true,
            signature: tx,
            message: "Rental session ended successfully",
        };
    } catch (error) {
      console.error("Error ending rental session", error);
      return null;
    }
}

export const TransferToVaultAndStartRental = async (amount: number, duration: number, id: String, wallet: AnchorWallet) => {
    const program = Contarct(wallet);
  
    if (!wallet) {
      console.error("Wallet not connected");
      return null;
    }
  
    try {
        const [rentalSessionPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("rental_session"), wallet.publicKey.toBuffer(), Buffer.from(id)],
            program.programId
        );
  
        const tx = await program.methods.transferToVaultAndRent(
            new BN(amount * LAMPORTS_PER_SOL),
            new BN(duration * 60),
            id,
            SECRET_KEY
        )
        .accounts({
            admin: new PublicKey(ADMIN_KEY),
            payer: wallet.publicKey,
        })
        .rpc();
        
        const transactionDetails = await program.provider.connection.getTransaction(tx);
        const logs = transactionDetails?.meta?.logMessages;
        const hasTransferLog = logs?.some(log => log.includes("Transferred"));

        if (!hasTransferLog) {
            console.error("Transfer to vault failed, no transfer log found in transaction");
            return null;
        }
        return {
            success: true,
            signature: tx,
            message: "Funds transferred to vault and rental session started successfully",
            rentalSessionPda,
        };
    } catch (error) {
      console.error("Error transferring to vault and starting rental", error);
      return null;
    }
}

export const WithdrawFromVault = async (amount: number, wallet: AnchorWallet, secretKey: string) => {
    const program = Contarct(wallet);
  
    if (!wallet) {
      console.error("Wallet not connected");
      return null;
    }
  
    try {
        const tx = await program.methods.withdrawFromVault(new BN(amount * LAMPORTS_PER_SOL), secretKey).accounts({
            admin: wallet.publicKey,
        })
        .rpc();
        return {
            success: true,
            signature: tx,
            message: "Funds withdrawn from vault account successfully",
        };
    } catch (error) {
      console.error("Error withdrawing from vault account", error);
      return null;
    }
}

export const GetVaultBalance = async (wallet: AnchorWallet, secretKey: string) => {
    const program = Contarct(wallet);
  
    if (!wallet) {
      console.error("Wallet not connected");
      return null;
    }
  
    try {
        const vaultAccount = await PublicKey.findProgramAddressSync(
            [Buffer.from("vault_account"), wallet.publicKey.toBuffer(), Buffer.from(secretKey)],
            program.programId
        );
        const vaultAccountBalance = await program.provider.connection.getBalance(vaultAccount[0]);
        return {
            success: true,
            balance: vaultAccountBalance / LAMPORTS_PER_SOL,
            message: "Vault balance retrieved successfully",
        };
    } catch (error) {
      console.error("Error fetching vault balance", error);
      return null;
    }
}