# Simple Installation Guide for SkillOS Portal

Welcome! Don't worry if you aren't super technical—this guide is written to help anyone easily start up the SkillOS platform on their computer, whether you use Windows, Mac, or Linux.

---

## 1. Things You Need to Install First

Before running the project, you need two standard programs installed on your computer.

### A. Install Node.js
This helps your computer run the website.
1. Go to the [Node.js Download Page](https://nodejs.org/).
2. **Windows & Mac**: Click on the big button that says "LTS (Recommended For Most Users)". Download it and install it like any normal program (just keep clicking "Next").
3. **Linux**: Use your software manager (e.g., `sudo apt install nodejs npm` on Ubuntu).

### B. Install LM Studio (For the Local AI)
This runs the smart AI on your computer so no private data is sent to the internet!
1. Go to [LMStudio.ai](https://lmstudio.ai/).
2. Download the version for your computer (Windows, Mac, or Linux).
3. Install and open the program.
4. Inside LM Studio, search for **"gemma-2-2b"**, **"qwen"**, **"llama"**, or **"granite"** (a small, fast AI) and click Download.
5. Once downloaded, go to the **Local Server** tab (looks like a double-arrow icon `↔` on the left).
6. Select your downloaded model at the top, and click the green **"Start Server"** button. Leave this window open in the background!
*(Note: The SkillOS AI Engine is smart enough to auto-detect whatever model you currently have loaded in LM Studio, so feel free to experiment!)*

---

## 2. Starting the Project

Now that you have Node.js and the AI running, let's start the actual SkillOS website! We have created automated scripts to make this incredibly easy.

### Step 1: Open the Project Folder
Open the folder where you saved the SkillOS project on your computer.

### Step 2: Run the Startup Script
- **Windows**: Just double-click the `start_server.bat` file.
- **Mac/Linux**: Open your Terminal, navigate to the folder, and run `./start_server.sh`.

*(This script will automatically install all necessary dependencies for both the frontend and backend, and then launch them simultaneously).*

### Step 3: Open it in your Browser!
Once the terminal says the servers are running, open your web browser (like Google Chrome or Safari) and go to this address:
**`http://localhost:5173`**

You should now see the SkillOS Learner Dashboard!

---

## Need Help?
If something goes wrong:
1. Make sure your LM Studio server is running (Step 1B).
2. Make sure you typed the commands exactly as shown.
3. Close the Terminal window and try starting from Step 2 again.
