import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from './idl/contract.json';
import { type AnchorWallet } from "@solana/wallet-adapter-react";
import bs58 from 'bs58';
import BN from "bn.js";

const connection = new Connection(clusterApiUrl("devnet"));

const secretKey = process.env.PRIVATE_KEY;
const vaultSecretKey = process.env.SECRET_KEY; 

if (!secretKey) {
  throw new Error("SECRET_KEY environment variable is not set.");
}
const payerKeypair = Keypair.fromSecretKey(bs58.decode(secretKey));

const wallet = {
    publicKey: payerKeypair.publicKey,
    signTransaction: async (transaction) => {
        (transaction as Transaction).partialSign(payerKeypair);
        return transaction;
    },
    signAllTransactions: async (transactions) => {
        return Promise.all(transactions.map(async (tx) => {
            (tx as Transaction).partialSign(payerKeypair);
            return tx;
        }));
    },
    connected: true,
} as AnchorWallet;

const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
const program = new Program(idl as any, provider);

export async function endRentalSession(
    id: string,
    userPubKey: string,
    isEscrow: boolean
) {
    
    const userPublicKey = new PublicKey(userPubKey);
    
    const [rentalSessionPDA, bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("rental_session"),
            userPublicKey.toBuffer(), 
            Buffer.from(id)
        ],
        program.programId
    );
    
    try {
        if (!isEscrow) {
            const accountInfo = await connection.getAccountInfo(rentalSessionPDA);
    
            if (!accountInfo) {
                throw new Error(`Rental session account not found at PDA: ${rentalSessionPDA.toString()}`);
            }
            
            const tx = await program.methods
                .endRentalSession(id, userPublicKey)  
                .accounts({
                    payer: wallet.publicKey,          
                    rentalSession: rentalSessionPDA,  
                })
                .signers([payerKeypair]) 
                .rpc();

            return tx;
        } else {
            if (!vaultSecretKey) {
                throw new Error("SECRET_KEY environment variable is not set for escrow termination.");
            }
            
            const txn = await program.methods
                .forceTerminateRental(id, vaultSecretKey)
                .accounts({
                    admin: wallet.publicKey,   
                    user: userPublicKey,       
                })
                .signers([payerKeypair])
                .rpc();
            return txn;
        }
    } catch (error) {
        console.error("Error ending rental session:", error);
        throw error; 
    }
}

export async function InitialiseHostPDA(id: string, hostName: string, machineType: string, os: string, diskSize: number, pricePerHour: number, userPubKey: string) {
    try{
        const tx = await program.methods.initialiseHostRegistration(id, hostName, machineType, os, new BN(diskSize), new BN(pricePerHour))
        .accounts({
            admin: payerKeypair.publicKey,
            userKey: new PublicKey(userPubKey),
        })
        .signers([payerKeypair])
        .rpc();
        return tx;
    } catch (error) {
        console.error("Error initializing host PDA:", error);
        throw error;    
    }
}

export async function deActivateHost(id: string, userPubKey: string) {
    const userPublicKey = new PublicKey(userPubKey);

    try {
        const tx = await program.methods.deactivateHost(id)
        .accounts({
            host: userPublicKey,
        })
        .signers([payerKeypair])
        .rpc();

        return tx;
    } catch (error) {
        console.error("Error deactivating host:", error);
        throw error; 
    }
}

export async function activateHost(id: string, userPubKey: string) {
    const userPublicKey = new PublicKey(userPubKey);

    try {
        const tx = await program.methods.activateHost(id)
        .accounts({
            host: userPublicKey,
        })
        .signers([payerKeypair])
        .rpc();

        return tx;
    } catch (error) {
        console.error("Error activating host:", error);
        throw error; 
    }
}