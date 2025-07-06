use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("423HDGsdSEMLnuPXsggRY2d3YHLGw9ijtAczh3pkCkAs");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        require!(ctx.accounts.admin.key() == ADMIN_PUBKEY, StakeError::Unauthorized);
        let vault_account = &mut ctx.accounts.vault_account;
        vault_account.owner = ctx.accounts.admin.key();
        let (_vault_account_key, bump) = Pubkey::find_program_address(
            &[b"vault_account", ctx.accounts.admin.key().as_ref(), b"vault"],
            ctx.program_id,
        );
        vault_account.bump = bump;

        msg!("Vault account initialized");
        Ok(())
    }

    pub fn transfer_to_vault_and_rent(
        ctx: Context<TransferToVaultAndRent>, 
        amount: u64, 
        duration_seconds: i64,
        id: u64
    ) -> Result<()> {
        require!(amount > 0, StakeError::InvalidAmount);
        require!(duration_seconds > 0, StakeError::InvalidDuration);
        
        // First, transfer funds to vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.vault_account.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;
        
        // Then, initialize rental session
        let rental_session = &mut ctx.accounts.rental_session;
        rental_session.user = ctx.accounts.payer.key();
        rental_session.amount_paid = amount;
        rental_session.start_time = Clock::get()?.unix_timestamp;
        rental_session.duration_seconds = duration_seconds;
        rental_session.is_active = true;
        rental_session.id = id;
        rental_session.end_time = rental_session.start_time + duration_seconds;

        let (_rental_session_key, bump) = Pubkey::find_program_address(
            &[b"rental_session", ctx.accounts.payer.key().as_ref(), id.to_le_bytes().as_ref()],
            ctx.program_id,
        );
        rental_session.bump = bump;

        msg!("Transferred {} lamports to vault and initialized rental session for user: {}", amount, ctx.accounts.payer.key());
        Ok(())
    }


    pub fn transfer_from_vault(ctx: Context<TransferFromVault>, amount: u64, _id: u64) -> Result<()> {
        require!(amount > 0, StakeError::InvalidAmount);

        let rental_session = &mut ctx.accounts.rental_session;
        require!(rental_session.is_active, StakeError::Unauthorized);
        require!(rental_session.amount_paid >= amount, StakeError::InsufficientFunds);
        require!(rental_session.user == ctx.accounts.payer.key(), StakeError::Unauthorized);
        let current_time = Clock::get()?.unix_timestamp;
        require!(current_time < rental_session.end_time, StakeError::Unauthorized);


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

    pub fn end_rental_session(ctx: Context<EndRentalSession>, _id: u64) -> Result<()> {
        let rental_session = &mut ctx.accounts.rental_session;
        require!(rental_session.is_active, StakeError::Unauthorized);
        require!(rental_session.id == _id, StakeError::Unauthorized);

        rental_session.is_active = false;
        rental_session.amount_paid = 0;

        msg!("Rental session ended for user: {}", ctx.accounts.payer.key());
        Ok(())
    }

    pub fn fund_vault(ctx: Context<FundVault>, amount: u64) -> Result<()> {
        require!(amount > 0, StakeError::InvalidAmount);

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
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), b"vault"],
        bump = vault_account.bump,
        constraint = vault_account.owner == admin.key() @ StakeError::Unauthorized,
    )]  
    pub vault_account: Account<'info, VaultAccount>,

    ///CHECK: Admin account for vault transfers
    pub admin: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + 32 + 1, // 8 bytes for discriminator, 32 bytes for Pubkey, 1 byte for bump
        seeds = [b"vault_account", admin.key().as_ref(), b"vault"],
        bump
    )]
    pub vault_account: Account<'info, VaultAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundVault<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), b"vault"],
        bump = vault_account.bump,
        constraint = vault_account.owner == admin.key() @ StakeError::Unauthorized,
    )]  
    pub vault_account: Account<'info, VaultAccount>,
    pub system_program: Program<'info, System>,
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
        constraint = vault_account.owner == admin.key() @ StakeError::Unauthorized,
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
#[derive(Accounts)]
#[instruction(id: u64)]
pub struct TransferToVaultAndRent<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_account", admin.key().as_ref(), b"vault"],
        bump = vault_account.bump,
        constraint = vault_account.owner == admin.key() @ StakeError::Unauthorized,
    )]  
    pub vault_account: Account<'info, VaultAccount>,

    ///CHECK: Admin account for vault transfers
    pub admin: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"rental_session", payer.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub rental_session: Account<'info, RentalSession>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndRentalSession<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"rental_session", payer.key().as_ref(), rental_session.id .to_le_bytes().as_ref()],
        bump = rental_session.bump,
        constraint = rental_session.is_active @ StakeError::Unauthorized,
        constraint = rental_session.user == payer.key() @ StakeError::Unauthorized,
    )]
    pub rental_session: Account<'info, RentalSession>,
}

#[account]
pub struct VaultAccount {
    pub owner: Pubkey,
    pub bump: u8,
}

#[account]
pub struct RentalSession {
    pub user: Pubkey,
    pub id: u64,
    pub amount_paid: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub duration_seconds: i64,
    pub is_active: bool,
    pub bump: u8,
}


#[error_code]
pub enum StakeError {
    #[msg("Unauthorized access to vault account")]
    Unauthorized,
    #[msg("Invalid amount specified for transfer")]
    InvalidAmount,
    #[msg("Vault account not initialized")]
    VaultNotInitialized,
    #[msg("Insufficient funds in vault account")]
    InsufficientFunds,
    #[msg("Invalid duration specified for rental session")]
    InvalidDuration,
    #[msg("Rental session is not active")]
    RentalSessionNotActive,
}

pub const ADMIN_PUBKEY: Pubkey = pubkey!("D8kz4JbFHtVcyE8AAcZGLeA28TwNm4JjpDaLBeqDzTwn");