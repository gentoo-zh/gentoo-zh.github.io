---
title: "二進位套件疑難排解"
description: "排查二進位套件的系統相容性、公鑰匯入與原始碼回退問題。"
---

## 二進位套件 {#binpkg}

<!-- anchor:usage -->

### OpenRC 和 systemd 都能使用嗎？ {#q3}

兩個頻道均以 `desktop/systemd` profile 建置，沒有單獨的 OpenRC 產物；OpenRC 系統能否使用，取決於套件的 USE 與相依性。USE 不相符時見[原始碼回退排查](#q1)。

### 匯入公鑰時出現 no writable keyring found，怎麼辦？ {#binpkg-keyring}

先執行 `getuto`，再依[公鑰匯入步驟](/binpkg-setup/#import-key)執行完整指令。目錄、Portage Local Trust Key、密碼與 `trustdb` 的初始化都在該步驟中完成。密碼由 `--passphrase-file` 從 `/etc/portage/gnupg/pass` 讀取；簽章驗證以 `portage` 使用者執行，因此須預先產生 `trustdb`，也就是該步驟最後的 `--check-trustdb`。

<!-- anchor:troubleshooting -->

### 設定後，emerge 為何仍然從原始碼編譯？ {#q1}

啟用二進位套件不保證每個套件都能使用現有產物。USE 不相符時，Portage 的一般安裝會改用可用的原始碼 ebuild；能否滿足相依性也取決於目前系統。先核對 [getbinpkg 設定](/binpkg-setup/#setup)、[頻道](/binpkg-setup/#channel)與[套件列表](/packages/)；服務異常可查看[服務狀態](/status/)。

### 二進位套件是否可能無法在我的 CPU 上執行？ {#q4}

仍有可能。兩個頻道使用 `CFLAGS="-O2 -pipe -march=x86-64 -mtune=generic"`，不使用 `-march=native`，但該設定不能改變 ebuild 附帶的上游預先編譯物件或程式庫。Portage 選擇二進位套件時不比較 `CFLAGS`，因此選用的二進位套件不一定與 CPU 相容。
