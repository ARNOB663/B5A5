#!/bin/bash

# Ride Booking API Test Script
# This script tests the basic functionality of the API

echo "🚗 Ride Booking API - Basic Test Script"
echo "======================================"

BASE_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make HTTP requests and check status
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local headers=$6

    echo -e "\n${YELLOW}Testing:${NC} $description"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$headers" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "$headers")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
        fi
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $status_code"
        echo "Response: $body" | jq '.' 2>/dev/null || echo "Response: $body"
    else
        echo -e "${RED}❌ FAIL${NC} - Expected: $expected_status, Got: $status_code"
        echo "Response: $body"
    fi
}

# Test 1: Health Check
test_endpoint "GET" "/health" "" 200 "Health Check"

# Test 2: Welcome Page
test_endpoint "GET" "/" "" 200 "Welcome Page"

# Test 3: Register Admin User
echo -e "\n${YELLOW}=== Authentication Tests ===${NC}"
admin_data='{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@test.com",
  "password": "AdminPass123",
  "phone": "+1111111111",
  "role": "admin"
}'
test_endpoint "POST" "/api/auth/register" "$admin_data" 201 "Register Admin User"

# Test 4: Register Rider
rider_data='{
  "firstName": "Jane",
  "lastName": "Rider",
  "email": "rider@test.com",
  "password": "RiderPass123",
  "phone": "+2222222222",
  "role": "rider"
}'
test_endpoint "POST" "/api/auth/register" "$rider_data" 201 "Register Rider"

# Test 5: Register Driver
driver_data='{
  "firstName": "Bob",
  "lastName": "Driver",
  "email": "driver@test.com",
  "password": "DriverPass123",
  "phone": "+3333333333",
  "role": "driver",
  "vehicleInfo": {
    "make": "Honda",
    "model": "Civic",
    "year": 2023,
    "licensePlate": "TEST123",
    "color": "Red"
  },
  "licenseNumber": "DL123456789"
}'
test_endpoint "POST" "/api/auth/register/driver" "$driver_data" 201 "Register Driver"

# Test 6: Login as Admin
echo -e "\n${YELLOW}=== Login Tests ===${NC}"
admin_login_data='{
  "email": "admin@test.com",
  "password": "AdminPass123"
}'
echo -e "\n${YELLOW}Testing:${NC} Admin Login"
admin_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$admin_login_data")

admin_token=$(echo "$admin_response" | jq -r '.data.token' 2>/dev/null)
if [ "$admin_token" != "null" ] && [ -n "$admin_token" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Admin login successful"
    echo "Admin Token: ${admin_token:0:50}..."
else
    echo -e "${RED}❌ FAIL${NC} - Admin login failed"
    echo "Response: $admin_response"
fi

# Test 7: Login as Rider
rider_login_data='{
  "email": "rider@test.com",
  "password": "RiderPass123"
}'
echo -e "\n${YELLOW}Testing:${NC} Rider Login"
rider_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$rider_login_data")

rider_token=$(echo "$rider_response" | jq -r '.data.token' 2>/dev/null)
if [ "$rider_token" != "null" ] && [ -n "$rider_token" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Rider login successful"
    echo "Rider Token: ${rider_token:0:50}..."
else
    echo -e "${RED}❌ FAIL${NC} - Rider login failed"
    echo "Response: $rider_response"
fi

# Test 8: Get Profile (with authentication)
if [ -n "$admin_token" ] && [ "$admin_token" != "null" ]; then
    echo -e "\n${YELLOW}=== Authenticated Tests ===${NC}"
    test_endpoint "GET" "/api/auth/profile" "" 200 "Get Admin Profile" "Authorization: Bearer $admin_token"
fi

# Test 9: Admin - Get Users
if [ -n "$admin_token" ] && [ "$admin_token" != "null" ]; then
    test_endpoint "GET" "/api/admin/users" "" 200 "Get All Users (Admin)" "Authorization: Bearer $admin_token"
fi

# Test 10: Admin - Get Pending Drivers
if [ -n "$admin_token" ] && [ "$admin_token" != "null" ]; then
    test_endpoint "GET" "/api/admin/drivers/pending" "" 200 "Get Pending Drivers (Admin)" "Authorization: Bearer $admin_token"
fi

# Test 11: Test unauthorized access
echo -e "\n${YELLOW}=== Security Tests ===${NC}"
test_endpoint "GET" "/api/auth/profile" "" 401 "Unauthorized Access (No Token)"

# Test 12: Test invalid token
test_endpoint "GET" "/api/auth/profile" "" 401 "Invalid Token Access" "Authorization: Bearer invalid_token"

# Test 13: Request Ride (Rider)
if [ -n "$rider_token" ] && [ "$rider_token" != "null" ]; then
    echo -e "\n${YELLOW}=== Ride Tests ===${NC}"
    ride_data='{
      "pickupLocation": {
        "address": "123 Test Street, Test City",
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        }
      },
      "destinationLocation": {
        "address": "456 Test Avenue, Test City",
        "coordinates": {
          "latitude": 40.7589,
          "longitude": -73.9851
        }
      },
      "rideType": "standard"
    }'
    test_endpoint "POST" "/api/rides/request" "$ride_data" 201 "Request Ride (Rider)" "Authorization: Bearer $rider_token"
fi

echo -e "\n${GREEN}======================================"
echo -e "🏁 Test Script Completed"
echo -e "======================================${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Check the MongoDB database for created users"
echo "2. Use admin token to approve drivers"
echo "3. Test the complete ride flow"
echo "4. Import the Postman collection for detailed testing"

echo -e "\n${YELLOW}Useful Commands:${NC}"
echo "- Health Check: curl $BASE_URL/health"
echo "- Welcome: curl $BASE_URL/"
echo "- Get Users: curl -H \"Authorization: Bearer \$ADMIN_TOKEN\" $BASE_URL/api/admin/users"
