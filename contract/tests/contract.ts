import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Contract } from "../target/types/contract";
import assert from "assert";

describe("contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const user = anchor.web3.Keypair.generate();
  const admin = anchor.web3.Keypair.generate();
  let vaultAccount: anchor.web3.PublicKey;
  const id = 1001;
  const secretKey = "my_secret_key"; 

  const program = anchor.workspace.contract as Program<Contract>;

  before(async () => {
    const airdropSignature = await anchor.getProvider().connection.requestAirdrop(
      user.publicKey,
      3 * anchor.web3.LAMPORTS_PER_SOL
    );
    const airdropSignatureAdmin = await anchor.getProvider().connection.requestAirdrop(
      admin.publicKey,
      3 * anchor.web3.LAMPORTS_PER_SOL
    );
    await anchor.getProvider().connection.confirmTransaction(airdropSignatureAdmin);
    console.log("Airdropped 3 SOL to admin account:", admin.publicKey.toBase58());
    await anchor.getProvider().connection.confirmTransaction(airdropSignature);
    console.log("Airdropped 3 SOL to user account:", user.publicKey.toBase58());

    [vaultAccount] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_account"), admin.publicKey.toBuffer(), Buffer.from(secretKey)],
      program.programId
    );
    console.log("Vault account address:", vaultAccount.toBase58());
  });

  it("initalise vault account", async () => {
    // Add your test here.
    const tx = await program.methods.initializeVault(secretKey).accounts({
      admin: admin.publicKey,
    })
    .signers([admin])
    .rpc();
    console.log("Your transaction signature", tx);
  });

  it("funds vault account", async () => {
    // Add your test here.
    const tx = await program.methods.fundVault(new anchor.BN(1000000000), secretKey).accounts({
      admin: admin.publicKey,
    })
      .signers([admin])
      .rpc();
    console.log("Your transaction signature", tx);
    const vaultAccountBalance = await anchor.getProvider().connection.getBalance(vaultAccount);
    console.log("Vault account balance:", vaultAccountBalance);
    assert.ok(vaultAccountBalance > 0, "Vault account should have a balance");
  });

  it("transfer to vault account and starts rental session", async () => {    
    const idBuffer = Buffer.alloc(8);
    idBuffer.writeBigUInt64LE(BigInt(id), 0);
    const [rentalSessionPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rental_session"), user.publicKey.toBuffer(), idBuffer],
      program.programId
    );

    const tx = await program.methods.transferToVaultAndRent(
        new anchor.BN(1000000000),
        new anchor.BN(10),
        new anchor.BN(id),
        secretKey
    )
    .accounts({
        admin: admin.publicKey,
        payer: user.publicKey,
    })
    .signers([user])
    .rpc();

    console.log("Transaction successful:", tx);
    const rental_session = await program.account.rentalSession.fetch(rentalSessionPda)
    assert.ok(rental_session.isActive, "Rental session should be active after transfer");
  });

  it("transfers funds from vault account to user account", async () => {
    const tx = await program.methods.transferFromVault(new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL), new anchor.BN(id), secretKey)
      .accounts({
        admin: admin.publicKey,
        payer: user.publicKey,
      })  
      .signers([user])
      .rpc();
    console.log("Your transaction signature", tx);  
    const vaultAccountBalance = await anchor.getProvider().connection.getBalance(vaultAccount);
    console.log("Vault account balance after transfer:", vaultAccountBalance);
    assert.ok(vaultAccountBalance < 2000000000, "Vault account should have a balance after transfer");
  });

  it("ends rental session", async () => {
    const idBuffer = Buffer.alloc(8);
    idBuffer.writeBigUInt64LE(BigInt(id), 0);

    const tx = await program.methods.endRentalSession(new anchor.BN(id)).accounts({
      payer: user.publicKey,
    })
    .signers([user])
    .rpc();
    console.log("Your transaction signature", tx);

    const updatedRentalSession = await program.account.rentalSession.fetch(
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("rental_session"), user.publicKey.toBuffer(), idBuffer],
        program.programId
      )[0]
    );
    console.log("Updated rental session:", updatedRentalSession);
    assert.ok(updatedRentalSession.isActive === false, "Rental session should be inactive after ending it");
  });

  it("withdraws funds from vault account", async () => {
    const tx = await program.methods.withdrawFunds(new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL), secretKey)
      .accounts({
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();
    console.log("Your transaction signature", tx);
    const vaultAccountBalance = await anchor.getProvider().connection.getBalance(vaultAccount);
    console.log("Vault account balance after withdrawal:", vaultAccountBalance);
    assert.ok(vaultAccountBalance < 1000000000, "Vault account should have a balance after withdrawal");
  });
});
