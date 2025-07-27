#!/bin/bash

set -e

echo "🔧 DeCloud Host Registration Script"

# === CONFIG ===
BACKEND_API="https://api.depin-worker.decloud.krishdev.xyz/v2/depinVerification"
CONFIG_DIR="$HOME/.decloud"
CONFIG_FILE="$CONFIG_DIR/config.json"

# === SYSTEM INFO COLLECTION ===
OS=$(uname -s)
CPU_CORES=$(nproc)
RAM_GB=$(free -g | awk '/^Mem/ {print $2}')
DISK_GB=$(df -BG --output=size / | tail -1 | tr -dc '0-9')
IP_ADDRESS=$(curl -s ifconfig.me)

# === PROMPT FOR USER INPUT ===
read -p "📨 Enter your wallet address (public key): " WALLET
read -p "📨 Enter your key (you provided at the time of registration): " KEY

# === DISPLAY SPECS ===
echo ""
echo "🖥️  Collected Specs:"
echo "  • OS           : $OS"
echo "  • CPU Cores    : $CPU_CORES"
echo "  • RAM (GB)     : $RAM_GB"
echo "  • Disk Size    : $DISK_GB"
echo "  • IP Address   : $IP_ADDRESS"
echo "  • Wallet       : $WALLET"
echo "  • Key          : $KEY"

# === REGISTER HOST ===
echo ""
echo "📡 Sending registration request to DeCloud..."

RESPONSE=$(curl -s -X POST "$BACKEND_API" \
  -H "Content-Type: application/json" \
  -d '{
    "os": "'"$OS"'",
    "cpu_cores": "'"$CPU_CORES"'",
    "ram_gb": "'"$RAM_GB"'",
    "disk_gb": "'"$DISK_GB"'",
    "ip_address": "'"$IP_ADDRESS"'",
    "wallet": "'"$WALLET"'",
    "key": "'"$KEY"'"
  }')

# Parse values from response
HOST_ID=$(echo "$RESPONSE" | jq -r '.host_id')
TOKEN=$(echo "$RESPONSE" | jq -r '.token')

# Validate
if [ "$HOST_ID" == "null" ] || [ -z "$HOST_ID" ] || [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Registration failed or missing token: $RESPONSE"
  exit 1
fi

# Store token securely
mkdir -p "$CONFIG_DIR"
echo "{
  \"host_id\": \"$HOST_ID\",
  \"token\": \"$TOKEN\",
  \"wallet\": \"$WALLET\",
  \"registered_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
}" > "$CONFIG_FILE"

echo "✅ Host registered successfully!"

