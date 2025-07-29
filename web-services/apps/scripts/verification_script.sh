#!/bin/bash

set -e

echo "🔧 DeCloud Host Registration Script (Cross-Platform)"

# === CONFIG ===
BACKEND_API="https://api.depin-worker.decloud.krishdev.xyz/v2/depinVerification"
CONFIG_DIR="$HOME/.decloud"
CONFIG_FILE="$CONFIG_DIR/config.json"

# === HELPER FUNCTIONS ===

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get CPU cores count
get_cpu_cores() {
    if command_exists nproc; then
        nproc
    elif [ -f /proc/cpuinfo ]; then
        grep -c ^processor /proc/cpuinfo
    elif command_exists sysctl; then
        sysctl -n hw.ncpu 2>/dev/null || sysctl -n hw.logicalcpu 2>/dev/null || echo "1"
    elif [ "$OS_TYPE" = "Windows" ]; then
        echo "${NUMBER_OF_PROCESSORS:-1}"
    else
        echo "1"
    fi
}

# Get RAM in GB
get_ram_gb() {
    if command_exists free; then
        # Linux
        free -g | awk '/^Mem/ {print $2}'
    elif command_exists vm_stat && command_exists sysctl; then
        # macOS
        local pages=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
        local page_size=$(vm_stat | grep "page size" | awk '{print $8}')
        local total_mem=$(sysctl -n hw.memsize)
        echo $((total_mem / 1024 / 1024 / 1024))
    elif [ -f /proc/meminfo ]; then
        # Alternative Linux method
        awk '/MemTotal/ {print int($2/1024/1024)}' /proc/meminfo
    elif [ "$OS_TYPE" = "Windows" ]; then
        # Windows (requires PowerShell)
        if command_exists powershell.exe; then
            powershell.exe -Command "(Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1GB" 2>/dev/null | head -1 | cut -d. -f1 || echo "4"
        else
            echo "4"
        fi
    else
        echo "4"
    fi
}

# Get disk size in GB
get_disk_gb() {
    if command_exists df; then
        # Try different df options for compatibility
        if df -BG --output=size / >/dev/null 2>&1; then
            # GNU df (Linux)
            df -BG --output=size / 2>/dev/null | tail -1 | tr -dc '0-9'
        elif df -k / >/dev/null 2>&1; then
            # POSIX df (macOS, BSD)
            df -k / | tail -1 | awk '{print int($2/1024/1024)}'
        else
            echo "100"
        fi
    elif [ "$OS_TYPE" = "Windows" ]; then
        # Windows
        if command_exists powershell.exe; then
            powershell.exe -Command "(Get-WmiObject -Class Win32_LogicalDisk -Filter \"DeviceID='C:'\").Size / 1GB" 2>/dev/null | head -1 | cut -d. -f1 || echo "100"
        else
            echo "100"
        fi
    else
        echo "100"
    fi
}

# Get public IP address
get_public_ip() {
    local ip=""
    
    # Try multiple services for reliability
    if command_exists curl; then
        ip=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null) || \
        ip=$(curl -s --connect-timeout 5 ipinfo.io/ip 2>/dev/null) || \
        ip=$(curl -s --connect-timeout 5 icanhazip.com 2>/dev/null)
    elif command_exists wget; then
        ip=$(wget -qO- --timeout=5 ifconfig.me 2>/dev/null) || \
        ip=$(wget -qO- --timeout=5 ipinfo.io/ip 2>/dev/null) || \
        ip=$(wget -qO- --timeout=5 icanhazip.com 2>/dev/null)
    fi
    
    # Validate IP format (basic check)
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        echo "$ip"
    else
        echo "127.0.0.1"
    fi
}

Check for required tools
check_dependencies() {
    local missing_tools=()
    
    if ! command_exists jq; then
        missing_tools+=("jq")
    fi
    
    if ! command_exists curl && ! command_exists wget; then
        missing_tools+=("curl or wget")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo "Missing required tools: ${missing_tools[*]}"
        echo ""
        echo "Please install the missing tools:"
        echo "  • On Ubuntu/Debian: sudo apt-get install jq curl"
        echo "  • On CentOS/RHEL: sudo yum install jq curl"
        echo "  • On macOS: brew install jq curl"
        echo "  • On Windows: Install Git Bash or WSL with the above packages"
        exit 1
    fi
}

# === SYSTEM DETECTION ===
OS_RAW=$(uname -s 2>/dev/null || echo "Unknown")
case "$OS_RAW" in
    Linux*)     OS_TYPE="Linux";;
    Darwin*)    OS_TYPE="macOS";;
    CYGWIN*|MINGW*|MSYS*) OS_TYPE="Windows";;
    *)          OS_TYPE="Unknown";;
esac

# === DEPENDENCY CHECK ===
# check_dependencies

# === SYSTEM INFO COLLECTION ===
echo "🔍 Detecting system information..."

OS="$OS_RAW"
CPU_CORES=$(get_cpu_cores)
RAM_GB=$(get_ram_gb)
DISK_GB=$(get_disk_gb)
IP_ADDRESS=$(get_public_ip)

# === PROMPT FOR USER INPUT ===
echo ""
read -p "📨 Enter your wallet address (public key): " WALLET
read -p "📨 Enter your key (you provided at the time of registration): " KEY

# Validate inputs
if [ -z "$WALLET" ] || [ -z "$KEY" ]; then
    echo "Wallet address and key cannot be empty!"
    exit 1
fi

# === DISPLAY SPECS ===
echo ""
echo "🖥️  Collected Specs:"
echo "  • OS Type      : $OS_TYPE"
echo "  • OS           : $OS"
echo "  • CPU Cores    : $CPU_CORES"
echo "  • RAM (GB)     : $RAM_GB"
echo "  • Disk Size    : ${DISK_GB}GB"
echo "  • IP Address   : $IP_ADDRESS"
echo "  • Wallet       : $WALLET"
echo "  • Key          : $KEY"

# === CONFIRMATION ===
echo ""
read -p "🤔 Do the specs look correct? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Registration cancelled by user."
    exit 1
fi

# === REGISTER HOST ===
echo ""
echo "Sending registration request to DeCloud..."

# Use curl if available, otherwise wget
if command_exists curl; then
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
else
    # Fallback to wget
    RESPONSE=$(wget -qO- --post-data='{
        "os": "'"$OS"'",
        "cpu_cores": "'"$CPU_CORES"'",
        "ram_gb": "'"$RAM_GB"'",
        "disk_gb": "'"$DISK_GB"'",
        "ip_address": "'"$IP_ADDRESS"'",
        "wallet": "'"$WALLET"'",
        "key": "'"$KEY"'"
      }' \
      --header="Content-Type: application/json" \
      "$BACKEND_API")
fi

# Check if we got a response
if [ -z "$RESPONSE" ]; then
    echo "No response from server. Please check your internet connection."
    exit 1
fi

# Parse values from response
HOST_ID=$(echo "$RESPONSE" | jq -r '.host_id' 2>/dev/null || echo "null")
TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null || echo "null")

# Validate response
if [ "$HOST_ID" == "null" ] || [ -z "$HOST_ID" ] || [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "Registration failed or missing token:"
    echo "$RESPONSE"
    exit 1
fi

# === STORE CONFIG ===
echo "💾 Storing configuration..."

# Create config directory (cross-platform)
mkdir -p "$CONFIG_DIR"

# Store configuration with cross-platform date
if command_exists date; then
    if date -u +"%Y-%m-%dT%H:%M:%SZ" >/dev/null 2>&1; then
        TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    else
        # macOS date command
        TIMESTAMP=$(date -u "+%Y-%m-%dT%H:%M:%SZ")
    fi
else
    TIMESTAMP="$(date)"
fi

echo "{
  \"host_id\": \"$HOST_ID\",
  \"token\": \"$TOKEN\",
  \"wallet\": \"$WALLET\",
  \"os_type\": \"$OS_TYPE\",
  \"registered_at\": \"$TIMESTAMP\"
}" > "$CONFIG_FILE"

# Set appropriate permissions (Unix-like systems only)
if [ "$OS_TYPE" != "Windows" ]; then
    chmod 600 "$CONFIG_FILE"
fi

echo ""
echo "Host registered successfully!"
echo "Configuration saved to: $CONFIG_FILE"
echo "Host ID: $HOST_ID"
echo ""
echo "Your DeCloud host is now registered and ready to use!"