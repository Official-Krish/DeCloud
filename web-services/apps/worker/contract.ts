import { clusterApiUrl, Connection } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from './idl/contract.json';
import { type AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

const wallet = {
  publicKey: new PublicKey(process.env.PUBLIC_KEY || "YourPublicKeyHere"),
    signTransaction: async (transaction) => {
        return transaction;
    },
    signAllTransactions: async (transactions) => {
        return transactions;
    },
    secretKey: process.env.SECRET_KEY ? Uint8Array.from(JSON.parse(process.env.SECRET_KEY)) : new Uint8Array(),
    connected: true,
} as AnchorWallet;

const network = clusterApiUrl('devnet');

const connection = new Connection(network);
const provider = new AnchorProvider(connection, wallet, {});

const program = new Program(idl as any, provider);

export async function endRentalSession(
  id: string,
  pubKey: string
) {
    const tx = await program.methods.endRentalSession(id, pubKey).accounts({
        payer: wallet.publicKey,
      })
      .signers([{ publicKey: wallet.publicKey, secretKey: process.env.SECRET_KEY ? Uint8Array.from(JSON.parse(process.env.SECRET_KEY)) : new Uint8Array() }])
      .rpc();
}