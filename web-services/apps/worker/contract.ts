import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from './idl/contract.json';
import { type AnchorWallet } from "@solana/wallet-adapter-react";
import bs58 from 'bs58';

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
    console.log("=== DEBUG INFO ===");
    console.log("Input userPubKey string:", userPubKey);
    console.log("Input id:", id);
    console.log("Server wallet (payer):", wallet.publicKey.toString());
    
    const userPublicKey = new PublicKey(userPubKey);
    console.log("Actual user public key:", userPublicKey.toString());
    
    const [rentalSessionPDA, bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("rental_session"),
            userPublicKey.toBuffer(), 
            Buffer.from(id)
        ],
        program.programId
    );
    
    console.log("Generated PDA:", rentalSessionPDA.toString());
    console.log("PDA Bump:", bump);
    
    try {
        if (!isEscrow) {
            const accountInfo = await connection.getAccountInfo(rentalSessionPDA);
            console.log("Account exists:", accountInfo !== null);
            
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

            console.log("Transaction signature:", tx);
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
            console.log("Force terminate transaction signature:", txn);
            return txn;
        }
    } catch (error) {
        console.error("Error ending rental session:", error);
        throw error; 
    }
}