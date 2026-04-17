# Project Report: Lumina Pro Bot Licensing & Automation System

---

### **1. පරමාර්ථය (Objective)**
Lumina Pro trading bot එක අනවසරයෙන් පිටපත් කිරීම සහ බෙදා හැරීම වැළැක්වීම සඳහා ආරක්ෂිත පද්ධතියක් (Hardware-Locked Licensing) සකස් කිරීම සහ එය පාරිභෝගිකයන්ට පහසුවෙන් භාවිතා කළ හැකි වන පරිදි වෙබ් අඩවිය සමඟ ස්වයංක්රීයව සම්බන්ධ කිරීම.

### **2. සිදු කරන ලද ප්රධාන වෙනස්කම් (Major Implementations)**

**A. Trading Bot එකේ ආරක්ෂාව (Client-Side Security):**
*   **HWID (Hardware ID) පද්ධතිය:** සෑම කම්පියුටර් එකකටම ආවේණික වූ රහස් අංකයක් (Hardware Serial) මගින් Bot එක Lock කරන ලදී.
*   **Time-Based Licenses:** දින 30, 90, 365 සහ Lifetime වශයෙන් කාල සීමාවන් සහිත Key වර්ග හඳුන්වා දෙන ලදී.
*   **Activation Screen:** Bot එක මුලින්ම Open කිරීමේදී Key එකක් ඉල්ලන විශේෂ තිරයක් (Dialog) එකතු කරන ලදී.

**B. වෙබ් අඩවියේ ස්වයංක්රීයකරණය (Website Backend - Cloudflare Worker):**
*   **D1 Database Integration:** පාරිභෝගිකයන්ගේ තොරතුරු සහ ඔවුන් ලබාගත් පැකේජ ගබඩා කිරීමට `licenses` නම් table එකක් නිර්මාණය කරන ලදී.
*   **Key Generation API:** මිලදී ගත් පාරිභෝගිකයාගේ Email එක සහ HWID එක පරීක්ෂා කර තත්පරයකටත් අඩු කාලයකදී ආරක්ෂිත ලයිසන් කේතයක් නිර්මාණය කරන API එකක් හදන ලදී.

**C. පාලක පුවරුව (Admin Control Panel):**
*   **Authorize License UI:** පාරිභෝගිකයාගේ Email එක ඇතුළත් කර ඔහුට අදාළ දින ගණන තෝරා ලයිසන් එක එසැණින් Activate කිරීමේ හැකියාව `admin-control.html` ගොනුවට එකතු කරන ලදී.

**D. පාරිභෝගික ද්වාරය (Activation Portal):**
*   **Self-Service Key Generation:** පාරිභෝගිකයන්ට තමන් මිලදී ගත් Bot එක Activate කරගැනීමට අවශ්ය Key එක ලබාගත හැකි Portal එකක් `lumina-pro.html` හි සකස් කරන ලදී.

---

### **3. ගොනු ව්යුහය (File Structure Changes)**

| පද්ධතිය | ගොනුව | කාර්යය |
| :--- | :--- | :--- |
| **Bot (Python)** | `auth.py` | HWID සහ Encryption logic එක. |
| | `gui.py` | ලයිසන් පරීක්ෂා කිරීමේ සහ Activation තිරය. |
| **Website** | `worker.js` | Key එක Generate කරන සහ Admin විසින් Approve කරන API. |
| | `admin-control.html` | පාරිභෝගිකයන් පද්ධතියට එක් කිරීමේ UI එක. |
| | `lumina-pro.html` | පාරිභෝගිකයින්ට තමන්ගේ Key එක ලබාගත හැකි Portal එක. |

---

### **4. ඉදිරි පියවර (How to Use)**

1.  **නව විකුණුමක් (New Sale):** පාරිභෝගිකයා මිලදී ගැනීම කළ පසු, **Admin Panel** එකට ගොස් ඔහුගේ Email එක ඇතුළත් කර "Authorize" කරන්න.
2.  **පාරිභෝගිකයාට උපදෙස්:** පාරිභෝගිකයාට ඔයාගේ සයිට් එකේ **Lumina Pro** පිටුවට ගොස් තම Email එක සහ HWID එක ගසා Key එක ලබාගන්නා ලෙස පවසන්න.
3.  **Bot එක බෙදාහැරීම:** Bot එක `.exe` එකක් ලෙස build කර පාරිභෝගිකයින්ට ලබා දෙන්න.

---
**සටහන:** `SECRET_SALT` එක කිසිවිටකත් වෙනස් නොකරන්න.
