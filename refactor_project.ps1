# 1. Create the new Feature-Based Directory Structure
Write-Host "Creating new folder structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src/features/auth" | Out-Null
New-Item -ItemType Directory -Force -Path "src/features/vendor" | Out-Null
New-Item -ItemType Directory -Force -Path "src/features/customer" | Out-Null
New-Item -ItemType Directory -Force -Path "src/features/rider" | Out-Null
New-Item -ItemType Directory -Force -Path "src/config" | Out-Null
New-Item -ItemType Directory -Force -Path "src/shared/ui" | Out-Null
New-Item -ItemType Directory -Force -Path "src/shared/hooks" | Out-Null

# 2. Move Dashboards to their specific features
Write-Host "Moving Dashboards..." -ForegroundColor Cyan

# Vendor
if (Test-Path "src/components/VendorDashboard.jsx") {
    Move-Item "src/components/VendorDashboard.jsx" "src/features/vendor/VendorDashboard.jsx"
    Write-Host "Moved VendorDashboard" -ForegroundColor Green
}

# Customer
if (Test-Path "src/components/CustomerDashboard.jsx") {
    Move-Item "src/components/CustomerDashboard.jsx" "src/features/customer/CustomerDashboard.jsx"
    Write-Host "Moved CustomerDashboard" -ForegroundColor Green
}

# Rider
if (Test-Path "src/components/RiderDashboard.jsx") {
    Move-Item "src/components/RiderDashboard.jsx" "src/features/rider/RiderDashboard.jsx"
    Write-Host "Moved RiderDashboard" -ForegroundColor Green
}

# 3. Create the central Firebase Config (The Singleton Fix)
# We create a new file here to ensure it exists in the right place
$firebaseContent = @"
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Parse the JSON string from the environment variable if available, else empty object
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

// Initialize Firebase (Singleton Pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
"@

Set-Content -Path "src/config/firebase.js" -Value $firebaseContent
Write-Host "Created src/config/firebase.js" -ForegroundColor Green

# 4. Clean up
# (Optional) Remove the old ChatWindow if it was a separate file, or move it to Shared
if (Test-Path "src/components/ChatWindow.jsx") {
    Move-Item "src/components/ChatWindow.jsx" "src/shared/ui/ChatWindow.jsx"
    Write-Host "Moved ChatWindow to Shared" -ForegroundColor Green
}

Write-Host "Refactoring Complete! 🚀" -ForegroundColor Yellow
Write-Host "IMPORTANT: You must now update the imports in your Dashboard files." -ForegroundColor Red
Write-Host "Change: import ... from '../firebase'" -ForegroundColor Gray
Write-Host "To:     import { db, auth } from '../../config/firebase'" -ForegroundColor Gray