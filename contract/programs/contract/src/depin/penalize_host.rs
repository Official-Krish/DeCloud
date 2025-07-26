use anchor_lang::prelude::*;

use crate::{constants::ADMIN_PUBKEY, errors::DepinErrors, state::HostMachineRegistration};

pub fn penalize_host(
    ctx: Context<PenalizeHost>,
    id: String
) -> Result<()> {
    let admin = &ctx.accounts.admin;
    require!(
        admin.key() == ADMIN_PUBKEY,
        DepinErrors::UnauthorizedAdmin
    );
    let host_machine = &mut ctx.accounts.host_machine;

    host_machine.earned = 0;
    host_machine.is_active = false;
    host_machine.started_at = 0;
    host_machine.penalized = true;
    
    msg!("Host {} penalized", id);

    Ok(())
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct PenalizeHost<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: User public key
    pub user: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"host_machine", user.key().as_ref(), id.as_bytes()],
        bump
    )]
    pub host_machine: Account<'info, HostMachineRegistration>
}