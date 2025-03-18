// ==UserScript==
// @name         Manual Update Script
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Güncelleme butonuna basınca GitHub'dan en son sürümü alıp kendini günceller
// @author       Sen
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    const RAW_GITHUB_URL = "https://raw.githubusercontent.com/tkgmplus/EBYS/main/EBYS%20Plus.js"; // Güncellenecek scriptin URL'si
    const CURRENT_VERSION = GM_getValue("script_version", "1.0"); // Kayıtlı sürüm

    function checkForUpdate() {
        console.log("Güncelleme kontrol ediliyor...");
        showNotification("Güncelleme kontrol ediliyor...");

        GM_xmlhttpRequest({
            method: "GET",
            url: RAW_GITHUB_URL,
            onload: function(response) {
                if (response.status !== 200) {
                    showNotification("Güncelleme kontrolü başarısız oldu!");
                    console.error("Güncelleme kontrol edilemedi. HTTP Yanıt Kodu:", response.status);
                    return;
                }

                console.log("Sunucudan yanıt alındı.");
                const latestScript = response.responseText.trim();

                if (!latestScript) {
                    showNotification("GitHub'dan script alınamadı!");
                    console.error("GitHub'dan boş yanıt döndü!");
                    return;
                }

                const latestVersionMatch = latestScript.match(/@version\s+([\d.]+)/);
                if (!latestVersionMatch) {
                    showNotification("Script versiyonu tespit edilemedi!");
                    console.error("Script içindeki @version bilgisi okunamadı!");
                    return;
                }

                const latestVersion = latestVersionMatch[1];

                if (latestVersion !== CURRENT_VERSION) {
                    console.log(`Yeni sürüm bulundu: ${latestVersion}`);
                    if (confirm(`Yeni sürüm bulundu: ${latestVersion}\nŞimdi güncellemek istiyor musunuz?`)) {
                        GM_setValue("script_version", latestVersion);
                        updateScript(latestScript);
                    }
                } else {
                    showNotification("Script zaten güncel.");
                }
            },
            onerror: function() {
                showNotification("Güncelleme isteği başarısız oldu!");
                console.error("GitHub'dan güncelleme isteği başarısız oldu.");
            }
        });
    }

    function updateScript(newScript) {
        console.log("Script güncelleniyor...");
        try {
            eval(newScript); // Yeni kodu çalıştır
            showNotification("Script başarıyla güncellendi! Sayfayı yenileyin.");
        } catch (error) {
            console.error("Güncelleme sırasında hata oluştu:", error);
            showNotification("Güncelleme sırasında hata oluştu!");
        }
    }

    // Güncelleme butonunu Tampermonkey menüsüne ekleyelim
    GM_registerMenuCommand("Scripti Güncelle", checkForUpdate);

    // Sayfanın sağ üstüne bir buton ekleyelim
    function addUpdateButton() {
        const button = document.createElement("button");
        button.textContent = "Güncellemeleri Kontrol Et";
        button.style.position = "fixed";
        button.style.top = "10px";
        button.style.right = "10px";
        button.style.zIndex = "10000";
        button.style.backgroundColor = "#28a745";
        button.style.color = "white";
        button.style.border = "none";
        button.style.padding = "10px";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        button.style.fontSize = "14px";

        button.addEventListener("click", function() {
            console.log("Güncelleme butonuna basıldı.");
            checkForUpdate();
        });

        document.body.appendChild(button);
    }

    // Sayfa yüklendiğinde butonu ekleyelim
    window.addEventListener("load", addUpdateButton);

    // Kullanıcıya bildirim göstermek için fonksiyon
    function showNotification(message) {
        const notification = document.createElement("div");
        notification.textContent = message;
        notification.style.position = "fixed";
        notification.style.top = "50px";
        notification.style.right = "10px";
        notification.style.zIndex = "10001";
        notification.style.backgroundColor = "#007bff";
        notification.style.color = "white";
        notification.style.padding = "10px";
        notification.style.borderRadius = "5px";
        notification.style.fontSize = "14px";
        notification.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000); // 3 saniye sonra bildirim kaybolur
    }
})();
