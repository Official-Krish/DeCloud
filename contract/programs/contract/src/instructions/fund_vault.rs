use anchor_lang::{prelude::*, system_program};
use crate::{errors::Errors, state::{ VaultAccount}};

pub fn fund_vault(ctx: Context<FundVault>, amount: u64) -> Result<()> {
    require!(amount > 0, Errors::InvalidAmount);

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.admin.to_account_info(),
            to: ctx.accounts.vault_account.to_account_info(),
        },
    );

    system_program::transfer(cpi_context, amount)?;

    msg!("Vault funded successfully! Amount: {} lamports", amount);
    Ok(())
}

#[derive(Accounts)]
pub struct FundVault<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), b"vault"],
        bump = vault_account.bump,
        constraint = vault_account.owner == admin.key() @ Errors::Unauthorized,
    )]  
    pub vault_account: Account<'info, VaultAccount>,
    pub system_program: Program<'info, System>,
}