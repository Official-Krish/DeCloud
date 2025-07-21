use anchor_lang::{prelude::*, system_program};

use crate::{errors::Errors, state::{EscrowSession, RentalSession, VaultAccount}};

pub fn finalize_rental_escrow(ctx: Context<FinalizeRentalEscrow>, _id: String, amount: u64, _secret_key: String) -> Result<()> {
    let rental = &mut ctx.accounts.rental_session;
    let escrow_session = &mut ctx.accounts.escrow_session;
    let escrow_vault = &ctx.accounts.escrow_vault;
    let user = &mut ctx.accounts.user;

    require!(rental.is_active, Errors::NotActive);
    require!(escrow_session.is_active, Errors::EscrowNotActive);
    require!(escrow_session.user == user.key(), Errors::EscrowNotFound);
    require!(escrow_session.id == _id, Errors::EscrowNotFound);
    require!(escrow_vault.lamports() >= amount, Errors::InsufficientFunds);

    let (escrow_vault_key, escrow_vault_bump) = Pubkey::find_program_address(
        &[b"escrow_vault", user.key().as_ref(), ctx.accounts.admin.key().as_ref(), _id.as_bytes()],
        ctx.program_id,
    );
    require!(escrow_vault.key() == escrow_vault_key, Errors::InvalidEscrowAccount);

    let user_key = user.key();
    let admin_key = ctx.accounts.admin.key();
    let escrow_vault_seeds = &[
        b"escrow_vault",
        user_key.as_ref(),
        admin_key.as_ref(),
        _id.as_bytes(),
        &[escrow_vault_bump],
    ];
    let signer_seeds = &[&escrow_vault_seeds[..]];
    
    // Transfer the requested amount to the user
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.user.to_account_info(),
        },
        signer_seeds,
    );
    system_program::transfer(cpi_context, amount)?;

    // Transfer the remaining amount to vault (if any)
    let remaining_amount = escrow_vault.to_account_info().lamports();
    
    if remaining_amount > 0 {
        let cpi_context_vault = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.escrow_vault.to_account_info(),
                to: ctx.accounts.vault_account.to_account_info(),
            },
            signer_seeds,
        );
        system_program::transfer(cpi_context_vault, remaining_amount)?;
    }

    // Update escrow session
    escrow_session.is_active = false;
    escrow_session.amount = 0;
    escrow_session.user = Pubkey::default();
    escrow_session.id = String::new();
    escrow_session.bump = 0; 

    // Update rental session
    rental.is_active = false;
    rental.end_time = Clock::get()?.unix_timestamp;
    rental.amount_paid = 0;
    
    msg!("Rental finalized successfully. Amount transferred: {}", amount);
    Ok(())
}

#[derive(Accounts)]
#[instruction(_id: String, amount: u64, _secret_key: String)]
pub struct FinalizeRentalEscrow<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    ///CHECK: Admin account for vault transfers
    pub admin: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"rental_session", user.key().as_ref(), _id.as_bytes()],
        bump,
    )]
    pub rental_session: Account<'info, RentalSession>,

    #[account(
        mut,
        seeds = [b"escrow_session", user.key().as_ref(), _id.as_bytes()],
        bump,
    )]
    pub escrow_session: Account<'info, EscrowSession>,

    ///CHECK: Escrow vault account
    #[account(
        mut,
        seeds = [b"escrow_vault", user.key().as_ref(), admin.key().as_ref(), _id.as_bytes()],
        bump,
    )]
    pub escrow_vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), _secret_key.as_bytes()],
        bump = vault_account.bump,
        constraint = vault_account.owner == admin.key() @ Errors::Unauthorized,
    )]
    pub vault_account: Account<'info, VaultAccount>,
    pub system_program: Program<'info, System>,
}