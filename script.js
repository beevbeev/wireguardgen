// تابع برای تولید کلیدهای WireGuard
function generateWireGuardKeys() {
    // تولید کلید خصوصی (32 بایت تصادفی)
    const privateKey = crypto.getRandomValues(new Uint8Array(32))
        .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');

    // تولید کلید عمومی از کلید خصوصی (با استفاده از الگوریتم Ed25519)
    const privateKeyBuffer = new TextEncoder().encode(privateKey);
    return crypto.subtle.generateKey(
        {
            name: "Ed25519",
        },
        true,
        ["sign", "verify"]
    ).then(keyPair => {
        return crypto.subtle.exportKey("raw", keyPair.publicKey)
            .then(publicKeyBuffer => {
                const publicKey = Array.from(new Uint8Array(publicKeyBuffer))
                    .map(byte => byte.toString(16).padStart(2, '0'))
                    .join('');
                return { privateKey, publicKey };
            });
    });
}

// تابع برای ساخت لینک WireGuard
function generateWireGuardLink(privateKey, publicKey) {
    // پارامترهای ثابت
    const serverInfo = "engage.cloudflareclient.com:2408";
    const address = "172.16.0.2/32,2606:4700:110:8918:721f:8c1b:ab48:49cb/128";
    const presharedkey = "";
    const reserved = "193,15,169";
    const mtu = "1280";

    // کدگذاری URL
    const privateKeyEncoded = encodeURIComponent(privateKey);
    const publicKeyEncoded = encodeURIComponent(publicKey);

    // ساخت لینک
    return `wireguard://${privateKeyEncoded}@${serverInfo}?address=${encodeURIComponent(address)}&presharedkey=${presharedkey}&reserved=${reserved}&publickey=${publicKeyEncoded}&mtu=${mtu}#Warp`;
}

// تابع اصلی برای نمایش لینک
function generateAndDisplayLink() {
    generateWireGuardKeys().then(keys => {
        const { privateKey, publicKey } = keys;
        const link = generateWireGuardLink(privateKey, publicKey);
        document.getElementById("link").innerText = link;

        // اضافه کردن قابلیت کپی کردن لینک
        document.getElementById("copyButton").addEventListener("click", () => {
            navigator.clipboard.writeText(link).then(() => {
                alert("لینک کپی شد!");
            }).catch(err => {
                console.error("خطا در کپی کردن لینک:", err);
            });
        });
    }).catch(err => {
        console.error("خطا در تولید کلیدها:", err);
        document.getElementById("link").innerText = "خطا در تولید لینک!";
    });
}

// اجرای تابع اصلی هنگام بارگذاری صفحه
window.onload = generateAndDisplayLink;
