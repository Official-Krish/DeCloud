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
    #[msg("Rental session is already active")]
    AlreadyActive,
    #[msg("Escrow session not found")]
    EscrowNotFound,
    #[msg("Escrow session already exists")]
    EscrowAlreadyExists,
    #[msg("Invalid escrow account")]
    InvalidEscrowAccount,
    #[msg("Escrow session is not active")]
    EscrowNotActive,
    #[msg("Rental session is not active")]
    NotActive,
    #[msg("Arithmetic overflow occurred during operation")]
    ArithmeticOverflow,
}
