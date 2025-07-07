use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;
pub mod constants;

use instructions::*;

declare_id!("423HDGsdSEMLnuPXsggRY2d3YHLGw9ijtAczh3pkCkAs");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>, secret_key: String) -> Result<()> {
        instructions::initialize_vault(ctx, secret_key)
    }

    pub fn transfer_to_vault_and_rent(
        ctx: Context<TransferToVaultAndRent>, 
        amount: u64, 
        duration_seconds: i64,
        id: u64,
        secret_key: String
    ) -> Result<()> {
        instructions::transfer_to_vault_and_rent(ctx, amount, duration_seconds, id, secret_key)
    }

    pub fn transfer_from_vault(ctx: Context<TransferFromVault>, amount: u64, id: u64, secret_key: String) -> Result<()> {
        instructions::transfer_from_vault(ctx, amount, id, secret_key)
    }

    pub fn end_rental_session(ctx: Context<EndRentalSession>, id: u64) -> Result<()> {
        instructions::end_rental_session(ctx, id)
    }

    pub fn fund_vault(ctx: Context<FundVault>, amount: u64, secret_key: String) -> Result<()> {
        instructions::fund_vault(ctx, amount, secret_key)
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>, amount: u64, secret_key: String) -> Result<()> {
        instructions::withdraw_funds(ctx, amount, secret_key)
    }
}