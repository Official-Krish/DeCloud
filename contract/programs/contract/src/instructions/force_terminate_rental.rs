use anchor_lang::{prelude::*, system_program};

use crate::{errors::Errors, state::{EscrowSession, RentalSession, VaultAccount}};

pub fn force_terminate_rental(
    ctx: Context<ForceTerminateRental>,
    id: String,
    _secret_key: String,
) -> Result<()> {
    let rental = &mut ctx.accounts.rental_session;
    let escrow_session = &mut ctx.accounts.escrow_session;
    let escrow_vault = &ctx.accounts.escrow_vault;
    let user = &ctx.accounts.user;

    require!(rental.is_active, Errors::NotActive);
    require!(escrow_session.is_active, Errors::EscrowNotActive);
    require!(rental.id == id, Errors::Unauthorized);
    require!(escrow_session.id == id, Errors::Unauthorized);
    require!(ctx.accounts.user.key() == rental.user, Errors::Unauthorized);

    let (escrow_vault_key, escrow_vault_bump) = Pubkey::find_program_address(
        &[b"escrow_vault", user.key().as_ref(), ctx.accounts.admin.key().as_ref(), id.as_bytes()],
        ctx.program_id,
    );
    require!(escrow_vault.key() == escrow_vault_key, Errors::InvalidEscrowAccount);
    require!(escrow_vault.lamports() > 0, Errors::InsufficientFunds);

    let user_key = user.key();
    let admin_key = ctx.accounts.admin.key();
    let escrow_vault_seeds = &[
        b"escrow_vault",
        user_key.as_ref(),
        admin_key.as_ref(),
        id.as_bytes(),
        &[escrow_vault_bump],
    ];
    let signer_seeds = &[&escrow_vault_seeds[..]];

    let cpi_context_vault = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.vault_account.to_account_info(),
        },
        signer_seeds,
    );
    system_program::transfer(cpi_context_vault, escrow_vault.lamports())?;

    // Deactivate the rental and escrow sessions
    rental.is_active = false;
    rental.end_time = Clock::get()?.unix_timestamp;
    rental.amount_paid = 0;

    escrow_session.is_active = false;
    escrow_session.user = Pubkey::default();
    escrow_session.id = String::new();
    escrow_session.bump = 0; 
    escrow_session.amount = 0;


    Ok(())
}

#[derive(Accounts)]
#[instruction(id: String, _secret_key: String)]
pub struct ForceTerminateRental<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: User account to be terminated
    pub user: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"rental_session", user.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub rental_session: Account<'info, RentalSession>,

    #[account(
        mut,
        seeds = [b"escrow_session", user.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub escrow_session: Account<'info, EscrowSession>,

    /// CHECK: PDA that holds SOL
    #[account(
        mut,
        seeds = [b"escrow_vault", user.key().as_ref(), admin.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub escrow_vault: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), _secret_key.as_bytes()],
        bump = vault_account.bump,
        constraint = vault_account.owner == admin.key() @ Errors::Unauthorized,
    )]
    pub vault_account: Account<'info, VaultAccount>,

    pub system_program: Program<'info, System>,
}