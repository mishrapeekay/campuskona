#!/bin/bash
# Quick Gateway Test Script
# Tests both email and SMS gateways for School Management System

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
print_header() {
    echo ""
    echo -e "${BLUE}================================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================================${NC}"
    echo ""
}

# Print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Print info
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Main script
print_header "School Management System - Gateway Test Suite"

# Check if .env file exists
if [ ! -f "../.env" ]; then
    print_error ".env file not found!"
    print_info "Please create .env file from .env.production.template"
    exit 1
fi

print_success ".env file found"

# Prompt for email
print_info "Enter email address for testing (or press Enter to skip email tests):"
read -r EMAIL

# Prompt for phone
print_info "Enter phone number for SMS testing (e.g., +91-9876543210, or press Enter to skip SMS tests):"
read -r PHONE

# Test email gateway
if [ -n "$EMAIL" ]; then
    print_header "Testing Email Gateway"
    python test_email_gateway.py --recipient "$EMAIL"
else
    print_warning "Skipping email tests"
fi

# Test SMS gateway
if [ -n "$PHONE" ]; then
    print_header "Testing SMS Gateway"
    python test_sms_gateway.py --phone "$PHONE"
else
    print_warning "Skipping SMS tests"
fi

print_header "Test Suite Complete"
print_info "Please check your email and phone for test messages"
print_info ""
print_info "Next steps:"
print_info "  1. Verify email delivery (check spam folder)"
print_info "  2. Verify SMS delivery"
print_info "  3. Update production .env with working credentials"
print_info "  4. Proceed to User Acceptance Testing"
