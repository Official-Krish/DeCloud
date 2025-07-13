use anchor_lang::prelude::*;

#[account]
pub struct RentalSession {
    pub user: Pubkey,
    pub id: String,
    pub amount_paid: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub duration_seconds: i64,
    pub is_active: bool,
    pub bump: u8,
}