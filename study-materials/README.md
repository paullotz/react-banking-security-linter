# Self-Administered Usability Study
## React-Banking-Security-Linter

Welcome! This study helps evaluate a new security tool for React developers. You'll spend about 30 minutes reviewing code with and without the tool.

## 📋 Before You Start

**You need:**
- [ ] Computer with internet
- [ ] Node.js v18 or later
- [ ] Visual Studio Code (free)
- [ ] 30 minutes of focused time

**Don't:**
- ❌ Look up answers online
- ❌ Ask friends for help
- ❌ Skip any steps

## 🚀 Step-by-Step Setup

### 1. Get the Code
```bash
# Open Terminal (Mac/Linux) or Command Prompt (Windows)
git clone https://github.com/paullotz/react-banking-security-linter
cd react-banking-security-linter
```

### 2. Install Everything
```bash
# Install pnpm (package manager)
npm install -g pnpm

# Install project dependencies
pnpm install

# Build the security plugin
pnpm build
```

### 3. Setup VS Code
1. **Open Visual Studio Code**
2. Click **Extensions** icon (left sidebar, or Ctrl+Shift+X)
3. Search for **"ESLint"** (by Microsoft)
4. Click **Install** (blue button)
5. **Restart VS Code**

### 4. Open the Project in VS Code
**IMPORTANT:** Open the ENTIRE project folder, not just parts!

1. In VS Code: **File → Open Folder**
2. Select the `react-banking-security-linter` folder you cloned
3. Click **"Open"**
4. If asked "Do you trust the authors?" click **"Yes"**

### 5. Test Your Setup
1. In VS Code, open: `study-materials/banking-app-treatment/src/pages/LoginPage.tsx`
2. Wait 10 seconds
3. **Look for red squiggles** (underlines) in the code
4. Hover over red squiggles - you should see a warning

✅ **If you see warnings, you're ready!**
❌ **If no warnings, see "Troubleshooting" section below**

## 📝 The Study (30 minutes total)

### Phase 1: Manual Review (15 minutes)
**Find security issues using only your eyes**

1. **Open folder:** `study-materials/banking-app-control/`
2. **Look at files** in `src/` folder (especially `.tsx` files)
3. **Start 15-minute timer**
4. **Search for code that looks unsafe:**
   - Where does user input come from?
   - Where does sensitive data go?
   - What could attackers exploit?

5. **Write down:**
   - How many security issues you found
   - How long to find first issue
   - Which files had issues

### Phase 2: Tool-Assisted Review (15 minutes)
**Find security issues with the plugin's help**

1. **Open folder:** `study-materials/banking-app-treatment/`
2. **Look for red squiggles** in any `.tsx` file
3. **Start 15-minute timer**
4. **Follow the warnings:**
   - Click red squiggles to see details
   - Check "Problems" panel (Ctrl+Shift+M)
   - Read warning messages carefully

5. **Write down:**
   - How many warnings the tool showed
   - How quickly you found issues
   - Were warnings clear and helpful?
   - Any confusing or wrong warnings?

## 🤔 What to Look For

**General security things:**
- User input (URLs, forms) used without checking
- Sensitive data (tokens, passwords) stored unsafely
- Data sent to risky functions

**The tool detects:**
- Unsafe navigation (open redirects)
- Insecure data storage
- Other React-specific security issues

## ✅ Quick Verification

Run this command to check if everything works:

```bash
cd /path/to/react-banking-security-linter
node verify-plugin.js
```

You should see:
- ✅ Plugin is built
- ✅ Plugin detects vulnerabilities in terminal
- ✅ Control app has no plugin warnings

## 🛠️ Troubleshooting

### Problem: No red squiggles in VS Code
**Try these in order:**

1. **Verify plugin works in terminal first:**
   ```bash
   cd study-materials/banking-app-treatment
   npx eslint src/pages/LoginPage.tsx
   ```
   If this shows security warnings, the plugin works! VS Code just needs configuration.

2. **Make sure VS Code is opening the ENTIRE monorepo:**
   - **File → Open Folder** (NOT "Open File" or "Add Folder to Workspace")
   - Select the `react-banking-security-linter` folder
   - NOT just `study-materials` or the app folders

3. **Restart ESLint server in VS Code:**
   - Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
   - Type "ESLint: Restart ESLint Server"
   - Press Enter
   - Wait 10 seconds

4. **Check ESLint is active:**
   - Look at bottom-right of VS Code
   - Should say "ESLint" (not "ESLint ❌")
   - If it says ❌, click it to see the error

5. **Check Problems panel:**
   - Press `Ctrl+Shift+M`
   - Look for ESLint messages (even if no squiggles)

6. **Try the VS Code workspace fix:**
   - Close all VS Code windows
   - Open VS Code fresh
   - **File → Open Folder** → select `react-banking-security-linter`
   - Wait 30 seconds for ESLint to initialize

### Problem: "Plugin not found" error
```bash
# Make sure plugin is built
pnpm build

# Check plugin exists
ls packages/eslint-plugin/dist/
# Should see index.js
```

### Problem: Can't install pnpm
```bash
# Try npm instead
npm install
npm run build
```

## 🤖 AI Troubleshooting Assistant

If you're stuck, try asking an AI assistant:

**Copy this prompt:**
```
I'm setting up a React security linter study. I cloned https://github.com/paullotz/react-banking-security-linter, ran pnpm install && pnpm build, installed VS Code ESLint extension, but I don't see red squiggles in the code. The terminal shows ESLint works when I run it manually. What VS Code settings do I need to fix?
```

**Or ask:**
- "How to fix ESLint not showing inline errors in VS Code for a monorepo?"
- "VS Code ESLint extension not working with workspace folder"
- "ESLint works in terminal but not showing in editor"

## ❓ Common Questions

**Q: What if I can't find any issues?**
A: That's okay! Just note how many you found (even if zero).

**Q: What if the tool shows warnings I don't understand?**
A: Read the warning message. If still unclear, note it as "confusing warning."

**Q: Can I use other tools or search online?**
A: No, please don't. The study is about your natural process.

**Q: What if setup takes too long?**
A: Try the troubleshooting steps. If still stuck after 15 minutes, you can stop.

**Q: Is my data anonymous?**
A: Yes, you're not asked for personal information.

## 🆘 Need Help?

If completely stuck after trying all troubleshooting:
1. Check if ESLint works in terminal (see step 4 above)
2. If terminal shows warnings, the tool works - continue the study using terminal output
3. Record that you used terminal instead of VS Code visuals

Thank you for participating! Your feedback helps improve security tools for React developers.