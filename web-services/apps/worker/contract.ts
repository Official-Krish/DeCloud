import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from './idl/contract.json';
import { type AnchorWallet } from "@solana/wallet-adapter-react";
import bs58 from 'bs58';

const connection = new Connection(clusterApiUrl("devnet"));

const secretKey = process.env.SECRET_KEY; 

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
  userPubKey: string
) {
    const userPublicKey = new PublicKey(userPubKey);
    const [rentalSessionPda, _rentalSessionBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("rental_session"),
            userPublicKey.toBuffer(), 
            Buffer.from(id), 
        ],
        program.programId 
    );

    try {
        const tx = await program.methods.endRentalSession(id, userPublicKey)
          .accounts({
            payer: wallet.publicKey,
            rentalSession: rentalSessionPda, 
          })
          .signers([payerKeypair]) 
          .rpc();

        console.log("Transaction signature:", tx);
        return tx; 
    } catch (error) {
        console.error("Error ending rental session:", error);
        throw error; 
    }
}
