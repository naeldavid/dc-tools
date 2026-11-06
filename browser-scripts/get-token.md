# Get Your Discord Token

1. Open **Any Chromium Browser** (Chrome, Edge, Opera, Firefox, or any modern browser really.)
2. Go to **[Discord Web](https://discord.com/app)**
3. Press **Control + Shift + J (Windows) | Command + Shift + J (MacOs)** to open the Browser Console
4. Press **Control + Shift + M (Windows) | Command + Shift + M (MacOs)**
5. Paste the below script and press **Enter**:

```javascript
const iframe = document.createElement("iframe");
console.log(
  "Token: %c%s",
  "font-size:16px;",
  JSON.parse(
    document.body.appendChild(iframe).contentWindow.localStorage.token,
  ),
);
iframe.remove();
```
