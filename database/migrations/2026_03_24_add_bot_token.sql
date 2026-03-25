-- Migration: Add Telegram Bot Token to Cooperativas
-- Version: 2026_03_24_03
-- Description: Allows each cooperative to have its own Telegram Bot for notifications

USE tu_cooperativa;

ALTER TABLE cooperativas ADD COLUMN IF NOT EXISTS telegram_bot_token VARCHAR(255) AFTER rif;
