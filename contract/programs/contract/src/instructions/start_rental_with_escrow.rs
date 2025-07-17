use anchor_lang::solana_program::system_instruction;
use anchor_lang::{prelude::*, system_program};
use anchor_lang::solana_program::program::invoke_signed;
use crate::state::{EscrowSession, RentalSession};
use crate::errors::Errors;

pub fn start_rental_with_escrow(
    ctx: Context<StartRentalWithEscrow>,
    amount: u64,
    _id: String,
) -> Result<()> {
    require!(amount > 0, Errors::InvalidAmount);

    let rental = &mut ctx.accounts.rental_session;
    let escrow_session = &mut ctx.accounts.escrow_session;
    let escrow_vault = &ctx.accounts.escrow_vault;
    let payer = &ctx.accounts.payer;
    let admin = &ctx.accounts.admin;

    require!(!rental.is_active, Errors::AlreadyActive);

    let (_escrow_key, escrow_vault_bump) = Pubkey::find_program_address(
        &[b"escrow_vault", ctx.accounts.payer.key().as_ref(), admin.key().as_ref(),_id.as_bytes()],
        ctx.program_id,
    );
    let payer_key = payer.key();
    let admin_key = admin.key();
    let escrow_vault_seeds = &[
        b"escrow_vault",
        payer_key.as_ref(),
        admin_key.as_ref(),
        _id.as_bytes(),
        &[escrow_vault_bump],
    ];
    let signer_seeds = &[&escrow_vault_seeds[..]];
    
    // Create the escrow vault account
    let rent = Rent::get()?;
    let required_lamports = rent.minimum_balance(0);
    
    // Transfer SOL to create and fund the escrow vault
    let create_account_ix = system_instruction::create_account(
        &payer.key(),
        &_escrow_key.key(),
        required_lamports + amount,
        0,
        &system_program::ID,
    );
    
    invoke_signed(
        &create_account_ix,
        &[
            payer.to_account_info(),
            escrow_vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        signer_seeds,
    )?;

    // Update rental session
    rental.start_time = Clock::get()?.unix_timestamp;
    rental.is_active = true;
    rental.amount_paid = amount;
    rental.user = ctx.accounts.payer.key();
    rental.id = _id.clone();
    rental.duration_seconds = 0;
    rental.end_time = 0;

    let (_rental_session_key, bump) = Pubkey::find_program_address(
        &[b"rental_session", ctx.accounts.payer.key().as_ref(), _id.as_bytes()],
        ctx.program_id,
    );
    rental.bump = bump;

    // Initialize metadata for escrow session
    escrow_session.amount = amount;
    escrow_session.start_time = Clock::get()?.unix_timestamp;
    escrow_session.is_active = true;
    escrow_session.user = ctx.accounts.payer.key();
    escrow_session.id = _id.clone();

    let (_escrow_key, escrow_bump) = Pubkey::find_program_address(
        &[b"escrow_session", ctx.accounts.payer.key().as_ref(), _id.as_bytes()],
        ctx.program_id,
    );
    escrow_session.bump = escrow_bump;

    msg!("Rental started with escrow successfully. Amount: {}, ID: {}", amount, _id);
    Ok(())
}

#[derive(Accounts)]
#[instruction(amount: u64, _id: String)]
pub struct StartRentalWithEscrow<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    ///CHECK: Admin account for vault transfers
    pub admin: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + RentalSession::SIZE,
        seeds = [b"rental_session", payer.key().as_ref(), _id.as_bytes()],
        bump
    )]
    pub rental_session: Account<'info, RentalSession>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + EscrowSession::SIZE,
        seeds = [b"escrow_session", payer.key().as_ref(), _id.as_bytes()],
        bump
    )]
    pub escrow_session: Account<'info, EscrowSession>,

    /// CHECK: PDA that holds SOL
    #[account(
        mut,
        seeds = [b"escrow_vault", payer.key().as_ref(), admin.key().as_ref(), _id.as_bytes()],
        bump
    )]
    pub escrow_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
