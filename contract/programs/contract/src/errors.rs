use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Unauthorized access to vault account")]
    Unauthorized,
    #[msg("Invalid amount specified for transfer")]
    InvalidAmount,
    #[msg("Vault account not initialized")]
    VaultNotInitialized,
    #[msg("Insufficient funds in vault account")]
    InsufficientFunds,
    #[msg("Rental session has expired")]
    RentalExpired,
    #[msg("Invalid duration specified")]
    InvalidDuration,
}
