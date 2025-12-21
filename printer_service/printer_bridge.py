import firebase_admin
from firebase_admin import credentials, firestore
import time
import os
import requests
import subprocess
import platform
import threading
from datetime import datetime

# --- CONFIGURATION ---
# 1. Download "serviceAccountKey.json" from Firebase Console -> Project Settings -> Service Accounts
# 2. Place it in this folder
CREDENTIAL_PATH = "serviceAccountKey.json"
DOWNLOAD_FOLDER = "downloads"

# --- SETTINGS ---
# Toggle this to True/False to switch between Automatic and Manual modes
AUTO_PRINT_ENABLED = True 

# Define which paper types should be auto-printed
# If an order is "Banner" or "Gift Box", it will be skipped by this script
AUTO_PRINT_TYPES = ["A4", "Standard", "Document", "Letter"]

# --- SETUP ---
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

# Initialize Firebase
try:
    if not os.path.exists(CREDENTIAL_PATH):
        print(f"❌ Error: '{CREDENTIAL_PATH}' not found.")
        print("Please download your service account key from Firebase Console and place it in this folder.")
        exit(1)
        
    cred = credentials.Certificate(CREDENTIAL_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Connected to Firebase Firestore")
    print(f"ℹ️  Auto-Print is {'ON' if AUTO_PRINT_ENABLED else 'OFF'} for types: {AUTO_PRINT_TYPES}")
except Exception as e:
    print(f"❌ Error connecting to Firebase: {e}")
    exit(1)

def print_file_os(file_path, printer_name=None):
    """
    Sends a file to the default OS printer.
    """
    system_name = platform.system()
    
    try:
        if system_name == "Windows":
            if printer_name:
                subprocess.run(['print', '/d:' + printer_name, file_path], check=True, shell=True)
            else:
                os.startfile(file_path, "print")
        elif system_name == "Darwin": # Mac
            cmd = ['lp', file_path]
            if printer_name:
                cmd.extend(['-d', printer_name])
            subprocess.run(cmd, check=True)
        else: # Linux
            cmd = ['lp', file_path]
            if printer_name:
                cmd.extend(['-d', printer_name])
            subprocess.run(cmd, check=True)
        return True, "Sent to printer"
    except Exception as e:
        return False, str(e)

def process_order(doc_id, order_data):
    """
    Downloads file from URL and prints it.
    """
    print(f"🖨️  Processing Order #{doc_id[:6]}...")
    
    file_url = order_data.get('fileUrl')
    file_name = order_data.get('fileName', f"order_{doc_id}.pdf")
    
    if not file_url:
        print("   ❌ No file URL found.")
        return

    # 1. Download File
    local_path = os.path.join(DOWNLOAD_FOLDER, f"{doc_id}_{file_name}")
    try:
        response = requests.get(file_url)
        with open(local_path, 'wb') as f:
            f.write(response.content)
        print(f"   ⬇️  Downloaded: {file_name}")
    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        return

    # 2. Update Status to 'Printing' (Shows in Dashboard as in-progress)
    db.collection('orders').document(doc_id).update({
        'status': 'Printing'
    })

    # 3. Print
    success, msg = print_file_os(local_path)

    # 4. Update Status based on result
    if success:
        print(f"   ✅ Sent to Printer")
        db.collection('orders').document(doc_id).update({
            'status': 'Completed', # Or 'Ready for Pickup'
            'printedAt': datetime.now()
        })
    else:
        print(f"   ❌ Print failed: {msg}")
        db.collection('orders').document(doc_id).update({
            'status': 'Failed',
            'errorMsg': msg
        })

def listen_for_orders():
    """
    Real-time listener for new paid orders.
    """
    print("👀 Watching for new 'Paid' orders...")
    
    def on_snapshot(col_snapshot, changes, read_time):
        for change in changes:
            if change.type.name == 'ADDED':
                order_data = change.document.to_dict()
                order_id = change.document.id
                
                # Double check status
                if order_data.get('status') == 'Paid':
                    paper_type = order_data.get('paperType', 'Standard')
                    
                    # --- FILTERING LOGIC ---
                    if not AUTO_PRINT_ENABLED:
                        print(f"🔔 Order #{order_id[:6]} received, but Auto-Print is OFF. Pending manual action.")
                        return

                    # Check if this paper type is in our allowed list (A4, Standard, etc.)
                    is_a4_type = any(t.lower() in paper_type.lower() for t in AUTO_PRINT_TYPES)
                    
                    if is_a4_type:
                        print(f"🔔 Auto-printing A4 Order #{order_id[:6]} ({paper_type})")
                        threading.Thread(target=process_order, args=(order_id, order_data)).start()
                    else:
                        print(f"🛑 Skipping Order #{order_id[:6]} ({paper_type}) - Not A4. Waiting for manual processing.")

    # Query: Watch orders where status == 'Paid'
    orders_ref = db.collection('orders')
    query = orders_ref.where(filter=firestore.FieldFilter('status', '==', 'Paid'))
    
    # Watch the query
    query_watch = query.on_snapshot(on_snapshot)

    # Keep script running
    while True:
        time.sleep(1)

if __name__ == "__main__":
    listen_for_orders()