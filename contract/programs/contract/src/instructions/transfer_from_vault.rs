use anchor_lang::{prelude::*, system_program};
use crate::{errors::Errors, state::{RentalSession, VaultAccount}}; 

pub fn transfer_from_vault(ctx: Context<TransferFromVault>, amount: u64, _id: u64) -> Result<()> {
    require!(amount > 0, Errors::InvalidAmount);

    let rental_session = &mut ctx.accounts.rental_session;
    require!(rental_session.is_active, Errors::Unauthorized);
    require!(rental_session.amount_paid >= amount, Errors::InsufficientFunds);
    require!(rental_session.user == ctx.accounts.payer.key(), Errors::Unauthorized);
    let current_time = Clock::get()?.unix_timestamp;
    require!(current_time < rental_session.end_time, Errors::Unauthorized);


    let vault_account = &ctx.accounts.vault_account;
    let admin = &ctx.accounts.admin;
    let admin_key = admin.key();
    let seeds = [
        b"vault_account",
        admin_key.as_ref(),
        b"vault",
        &[vault_account.bump],
    ];
    let signer_seeds = &[&seeds[..]];
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.vault_account.to_account_info(),
            to: ctx.accounts.payer.to_account_info(),
        },
        signer_seeds,
    );
    system_program::transfer(cpi_context, amount)?;
    rental_session.is_active = false;
    rental_session.amount_paid = 0;
    msg!("Transferred {} lamports from vault account", amount);
    Ok(())
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct TransferFromVault<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), b"vault"],
        bump = vault_account.bump,
        constraint = vault_account.owner == admin.key() @ Errors::Unauthorized,
    )]
    pub vault_account: Account<'info, VaultAccount>,
    ///CHECK: Admin account for vault transfers
    pub admin: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"rental_session", payer.key().as_ref(), id.to_le_bytes().as_ref()],
        bump = rental_session.bump,
    )]
    pub rental_session: Account<'info, RentalSession>,
    pub system_program: Program<'info, System>,
}