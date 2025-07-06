use anchor_lang::prelude::*;

use crate::{errors::Errors, state::RentalSession};

pub fn end_rental_session(ctx: Context<EndRentalSession>, _id: u64) -> Result<()> {
    let rental_session = &mut ctx.accounts.rental_session;
    require!(rental_session.is_active, Errors::Unauthorized);
    require!(rental_session.id == _id, Errors::Unauthorized);

    rental_session.is_active = false;
    rental_session.amount_paid = 0;

    msg!("Rental session ended for user: {}", ctx.accounts.payer.key());
    Ok(())
}

#[derive(Accounts)]
pub struct EndRentalSession<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"rental_session", payer.key().as_ref(), rental_session.id .to_le_bytes().as_ref()],
        bump = rental_session.bump,
        constraint = rental_session.is_active @ Errors::Unauthorized,
        constraint = rental_session.user == payer.key() @ Errors::Unauthorized,
    )]
    pub rental_session: Account<'info, RentalSession>,
}