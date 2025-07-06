use anchor_lang::prelude::*;

#[account]
pub struct VaultAccount {
    pub owner: Pubkey,
    pub bump: u8,
}