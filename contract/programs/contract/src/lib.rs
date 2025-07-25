use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;
pub mod constants;
pub mod depin;

use instructions::*;
use depin::*;

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
        id: String,
        secret_key: String
    ) -> Result<()> {
        instructions::transfer_to_vault_and_rent(ctx, amount, duration_seconds, id, secret_key)
    }

    pub fn transfer_from_vault(ctx: Context<TransferFromVault>, amount: u64, id: String, secret_key: String) -> Result<()> {
        instructions::transfer_from_vault(ctx, amount, id, secret_key)
    }

    pub fn end_rental_session(ctx: Context<EndRentalSession>, id: String, _user_pub_key: Pubkey) -> Result<()> {
        instructions::end_rental_session(ctx, id, _user_pub_key)
    }

    pub fn fund_vault(ctx: Context<FundVault>, amount: u64, secret_key: String) -> Result<()> {
        instructions::fund_vault(ctx, amount, secret_key)
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>, amount: u64, secret_key: String) -> Result<()> {
        instructions::withdraw_funds(ctx, amount, secret_key)
    }

    pub fn start_rental_with_escrow(
        ctx: Context<StartRentalWithEscrow>, 
        amount: u64, 
        id: String
    ) -> Result<()> {
        instructions::start_rental_with_escrow(ctx, amount, id)
    }

    pub fn finalise_rental_with_escrow(
        ctx: Context<FinalizeRentalEscrow>, 
        id: String, 
        amount: u64,
        secret_key: String
    ) -> Result<()> {
        instructions::finalize_rental_escrow(ctx, id, amount, secret_key)
    }

    pub fn top_up_escrow(ctx: Context<TopUpEscrow>, id: String, amount: u64) -> Result<()> {
        instructions::top_up_escrow(ctx, id, amount)
    }

    pub fn force_terminate_rental(
        ctx: Context<ForceTerminateRental>, 
        id: String, 
        secret_key: String
    ) -> Result<()> {
        instructions::force_terminate_rental(ctx, id, secret_key)
    }

    pub fn initialise_host_registration(
        ctx: Context<InitialiseHostRegistration>, 
        id: String,
        host_name: String,
        machine_type: String,
        os: String,
        disk_size: u64,
        sol_per_hour: u64
    ) -> Result<()> {
        depin::initialise_host_registration(ctx, id, host_name, machine_type, os, disk_size, sol_per_hour)
    }

    pub fn activate_host(
        ctx: Context<ActivateHost>, 
        id: String, 
    ) -> Result<()> {
        depin::activate_host(ctx, id)
    }

    pub fn deactivate_host(
        ctx: Context<DeactivateHost>, 
        id: String, 
    ) -> Result<()> {
        depin::deactivate_host(ctx, id)
    }

    pub fn claim_rewards(
        ctx: Context<ClaimRewards>, 
        id: String, 
        secret_key: String
    ) -> Result<()> {
        depin::claim_rewards(ctx, id, secret_key)
    }

    pub fn penalize_host(
        ctx: Context<PenalizeHost>, 
        id: String, 
    ) -> Result<()> {
        depin::penalize_host(ctx, id)
    }
}