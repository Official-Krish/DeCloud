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
  const id = "1001";
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
    assert.ok(vaultAccountBalance > 1, "Vault account should have a balance");
  });

  // it("transfer to vault account and starts rental session", async () => {    
  //   const [rentalSessionPda] = await anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("rental_session"), user.publicKey.toBuffer(), Buffer.from(id)],
  //     program.programId
  //   );

  //   const tx = await program.methods.transferToVaultAndRent(
  //       new anchor.BN(1000000000),
  //       new anchor.BN(10),
  //       id,
  //       secretKey
  //   )
  //   .accounts({
  //       admin: admin.publicKey,
  //       payer: user.publicKey,
  //   })
  //   .signers([user])
  //   .rpc();

  //   console.log("Transaction successful:", tx);
  //   const rental_session = await program.account.rentalSession.fetch(rentalSessionPda)
  //   assert.ok(rental_session.isActive, "Rental session should be active after transfer");
  // });

  // it("transfers funds from vault account to user account", async () => {
  //   const tx = await program.methods.transferFromVault(new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL), id, secretKey)
  //     .accounts({
  //       admin: admin.publicKey,
  //       payer: user.publicKey,
  //     })  
  //     .signers([user])
  //     .rpc();
  //   console.log("Your transaction signature", tx);  
  //   const vaultAccountBalance = await anchor.getProvider().connection.getBalance(vaultAccount);
  //   console.log("Vault account balance after transfer:", vaultAccountBalance);
  //   assert.ok(vaultAccountBalance < 2000000000, "Vault account should have a balance after transfer");
  // });

  // it("ends rental session", async () => {
  //   const idBuffer = Buffer.alloc(8);
  //   idBuffer.writeBigUInt64LE(BigInt(id), 0);

  //   const tx = await program.methods.endRentalSession(id, user.publicKey).accounts({
  //     payer: user.publicKey,
  //   })
  //   .signers([user])
  //   .rpc();
  //   console.log("Your transaction signature", tx);

  //   const updatedRentalSession = await program.account.rentalSession.fetch(
  //     anchor.web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("rental_session"), user.publicKey.toBuffer(), idBuffer],
  //       program.programId
  //     )[0]
  //   );
  //   console.log("Updated rental session:", updatedRentalSession);
  //   assert.ok(updatedRentalSession.isActive === false, "Rental session should be inactive after ending it");
  // });

  // it("withdraws funds from vault account", async () => {
  //   const tx = await program.methods.withdrawFunds(new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL), secretKey)
  //     .accounts({
  //       admin: admin.publicKey,
  //     })
  //     .signers([admin])
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  //   const vaultAccountBalance = await anchor.getProvider().connection.getBalance(vaultAccount);
  //   console.log("Vault account balance after withdrawal:", vaultAccountBalance);
  //   assert.ok(vaultAccountBalance < 1000000000, "Vault account should have a balance after withdrawal");
  // });

  it("starts a new rental session with escrow", async () => {
    const [escrowVault, escrowBump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_vault"), user.publicKey.toBuffer(), admin.publicKey.toBuffer() ,Buffer.from(id)],
      program.programId
    );
    const tx = await program.methods.startRentalWithEscrow(
      new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL),
      id,
    )
    .accounts({
      payer: user.publicKey,
      admin: admin.publicKey,
      // @ts-ignore
      escrowVault: escrowVault,
    })
    .signers([user])
    .rpc();
    const rentalSessionPda = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rental_session"), user.publicKey.toBuffer(), Buffer.from(id)],
      program.programId
    );
    const rentalSession = await program.account.rentalSession.fetch(rentalSessionPda[0]);
    assert.ok(rentalSession.isActive, "Rental session should be active after starting with escrow");
  });

  it("top up escrow session", async () => {
    const escrowSessionPda = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_session"), user.publicKey.toBuffer(), Buffer.from(id)],
      program.programId
    );

    const tx = await program.methods.topUpEscrow(id, new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL))
      .accounts({
        user: user.publicKey,
        admin: admin.publicKey,
      })
      .signers([user])
      .rpc();

    const escrowSession = await program.account.escrowSession.fetch(escrowSessionPda[0]);
    assert.ok(escrowSession.amount.toNumber() > 0, "Escrow session should have a positive amount after top-up");
  });

  it("force terminates rental session", async () => {
    // Derive all required PDAs
    const [escrowSessionPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_session"), user.publicKey.toBuffer(), Buffer.from(id)],
      program.programId
    );
    
    const tx = await program.methods.forceTerminateRental(id, secretKey)
      .accounts({
        admin: admin.publicKey,
        user: user.publicKey,
      })
      .signers([admin])
      .rpc();

    console.log("Force terminate transaction signature", tx);
    
    const escrowSession = await program.account.escrowSession.fetch(escrowSessionPda);
    assert.ok(!escrowSession.isActive, "Escrow session should be inactive after force termination");
});

  it("finalizes rental escrow", async () => {
    const escrowSessionPda = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_session"), user.publicKey.toBuffer(), Buffer.from(id)],
      program.programId
    );

    const escrowVault = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_vault"), user.publicKey.toBuffer(), admin.publicKey.toBuffer(), Buffer.from(id)],
      program.programId
    );

    const escrow_vault = await anchor.getProvider().connection.getBalance(escrowVault[0]);
    console.log("Escrow account balance before finalization:", escrow_vault / anchor.web3.LAMPORTS_PER_SOL);

    const tx = await program.methods.finaliseRentalWithEscrow(id, new anchor.BN(0.25 * anchor.web3.LAMPORTS_PER_SOL), secretKey)
      .accounts({
        user: user.publicKey,
        admin: admin.publicKey,
      })
      .signers([user])
      .rpc();

    const escrowSession = await program.account.escrowSession.fetch(escrowSessionPda[0]);
    const vaultAccountBalance = await anchor.getProvider().connection.getBalance(vaultAccount);
    console.log("Vault account balance after finalization:", vaultAccountBalance / anchor.web3.LAMPORTS_PER_SOL);
    const escrowVaultBalance = await anchor.getProvider().connection.getBalance(escrowVault[0]);
    console.log("Escrow vault balance after finalization:", escrowVaultBalance / anchor.web3.LAMPORTS_PER_SOL);
    assert.ok(vaultAccountBalance > 2, "Vault account should have a balance after finalization");
    assert.ok(!escrowSession.isActive, "Escrow session should be inactive after finalization");
  });
});
