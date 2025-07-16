use anchor_lang::{prelude::*, system_program};

use crate::{errors::Errors, state::{EscrowSession, RentalSession}};

pub fn top_up_escrow(ctx: Context<TopUpEscrow>, _id: String, amount: u64) -> Result<()> {
    let escrow_session = &mut ctx.accounts.escrow_session;
    let user = &mut ctx.accounts.user;
    let rental_session = &mut ctx.accounts.rental_session;

    require!(escrow_session.is_active, Errors::EscrowNotActive);
    require!(escrow_session.user == user.key(), Errors::Unauthorized);
    require!(escrow_session.id == _id, Errors::EscrowNotFound);
    require!(rental_session.is_active, Errors::NotActive);
    require!(amount > 0, Errors::InvalidAmount);
    
    // Verify the escrow vault address
    let (escrow_vault_key, _escrow_vault_bump) = Pubkey::find_program_address(
        &[b"escrow_vault", user.key().as_ref(), ctx.accounts.admin.key().as_ref(), _id.as_bytes()],
        ctx.program_id,
    );
    require!(ctx.accounts.escrow_vault.key() == escrow_vault_key, Errors::InvalidEscrowAccount);
    
    // Transfer the amount to the escrow vault
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.escrow_vault.to_account_info(),
        },
    );
    
    system_program::transfer(cpi_context, amount)?;

    // Update escrow session with overflow protection
    escrow_session.amount = escrow_session.amount.checked_add(amount)
        .ok_or(Errors::ArithmeticOverflow)?;
    
    rental_session.amount_paid = rental_session.amount_paid.checked_add(amount)
        .ok_or(Errors::ArithmeticOverflow)?;

    msg!("Escrow topped up successfully. Amount: {}", amount);

    Ok(())
}

#[derive(Accounts)]
#[instruction(_id: String)]
pub struct TopUpEscrow<'info> {
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
    pub system_program: Program<'info, System>,
}