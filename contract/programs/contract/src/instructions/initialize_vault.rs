use anchor_lang::prelude::*;

use crate::{constants::ADMIN_PUBKEY, errors::Errors, state::VaultAccount};

pub fn initialize_vault(ctx: Context<InitializeVault>, _secret_key: String) -> Result<()> {
    require!(ctx.accounts.admin.key() == ADMIN_PUBKEY, Errors::Unauthorized);
    let vault_account = &mut ctx.accounts.vault_account;
    vault_account.owner = ctx.accounts.admin.key();
    let (_vault_account_key, bump) = Pubkey::find_program_address(
        &[b"vault_account", ctx.accounts.admin.key().as_ref(), _secret_key.as_bytes()],
        ctx.program_id,
    );
    vault_account.bump = bump;

    msg!("Vault account initialized");
    Ok(())
}

#[derive(Accounts)]
#[instruction(secret_key: String)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + 32 + 1,
        seeds = [b"vault_account", admin.key().as_ref(), secret_key.as_bytes()],
        bump
    )]
    pub vault_account: Account<'info, VaultAccount>,
    pub system_program: Program<'info, System>,
}