#!/bin/bash

# Job Search Copilot - Quick Test Script
# Tests backend API endpoints to verify everything is working

API_URL="http://localhost:8000"

echo "🧪 Testing Job Search Copilot API..."
echo ""

# Test 1: Health check
echo "1️⃣ Health Check"
curl -s "${API_URL}/health" | python3 -m json.tool
echo ""

# Test 2: Analyze JD
echo "2️⃣ Analyze Job Description"
curl -s -X POST "${API_URL}/api/analyze_jd" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Frontend Engineer at StartupXYZ\nLocation: Remote\nSalary: $120k-$160k\n\nWe are looking for an experienced frontend developer to build our next-generation web app.\n\nResponsibilities:\n- Build responsive React applications\n- Implement complex UI components\n- Collaborate with designers\n- Write clean, maintainable code\n\nRequired Skills:\n- React, TypeScript\n- CSS, Tailwind\n- REST APIs\n- Git\n\nPreferred:\n- Next.js\n- GraphQL\n- Testing (Jest, Cypress)",
    "candidate_profile": "Frontend developer with 3 years experience in React, TypeScript, and modern CSS. Built multiple responsive web apps."
  }' | python3 -m json.tool | head -30
echo ""

# Test 3: Generate Content
echo "3️⃣ Generate Tailored Content"
curl -s -X POST "${API_URL}/api/generate_content" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Frontend Engineer at StartupXYZ with React and TypeScript",
    "candidate_profile": "Frontend developer with 3 years React experience"
  }' | python3 -m json.tool
echo ""

# Test 4: Create Application
echo "4️⃣ Create Application"
APP_RESPONSE=$(curl -s -X POST "${API_URL}/api/applications" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Frontend Engineer",
    "company": "StartupXYZ",
    "location": "Remote",
    "url": "https://example.com/jobs/123",
    "stage": "Applied",
    "notes": "Great culture, competitive salary"
  }')
echo "$APP_RESPONSE" | python3 -m json.tool
APP_ID=$(echo "$APP_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "1")
echo ""

# Test 5: List Applications
echo "5️⃣ List Applications"
curl -s "${API_URL}/api/applications" | python3 -m json.tool
echo ""

# Test 6: Update Application
echo "6️⃣ Update Application Status"
curl -s -X PATCH "${API_URL}/api/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"stage": "Interviewing", "notes": "Phone screen scheduled for next week"}' \
  | python3 -m json.tool
echo ""

echo "✅ All tests completed!"
echo ""
echo "🌐 Visit http://localhost:3000/chat to use the full AI-powered interface"
