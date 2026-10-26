import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const app = initializeApp({
    apiKey: "AIzaSyC9jimbxh2n-gBO_6RazEdDRDNNA1DtM60",
    authDomain: "project-a52e3.firebaseapp.com",
    projectId: "project-a52e3",
    storageBucket: "project-a52e3.firebasestorage.app",
    messagingSenderId: "30047291261",
    appId: "1:30047291261:web:8ae372e43e45ebcc906e14"
});
const db = getFirestore(app);
const auth = getAuth(app);

let dbEmpty = false;

// ===== التنسيق =====
const style = document.createElement("style");
style.textContent = `
.admin-link{background:none;border:none;color:#e6dcd3;opacity:.55;font-family:'Cairo',sans-serif;font-size:13px;cursor:pointer;margin-top:8px}
.admin-link:hover{opacity:1}
.adm-overlay{position:fixed;inset:0;background:rgba(43,33,28,.65);display:none;align-items:center;justify-content:center;z-index:200;padding:16px}
.adm-overlay.show{display:flex}
.adm-box{background:#fff;border-radius:18px;padding:26px 22px;width:min(380px,100%);box-shadow:0 10px 40px rgba(0,0,0,.35);border-top:5px solid #ff6600}
.adm-box h3{text-align:center;font-size:22px;font-weight:800;color:#2b211c;margin-bottom:16px}
.adm-box input{width:100%;padding:12px 14px;margin-bottom:12px;border:2px solid #ffd9bf;border-radius:12px;font-size:16px;font-family:'Cairo',sans-serif;outline:none}
.adm-box input:focus{border-color:#19A7B9}
.adm-btn{width:100%;padding:12px;border:none;border-radius:24px;background:#ff6600;color:#fff;font-weight:800;font-size:16px;font-family:'Cairo',sans-serif;cursor:pointer}
.adm-btn.alt{background:#fff;color:#8a7b72;border:2px solid #ddd;margin-top:8px}
.adm-err{color:#d62828;font-size:14px;font-weight:700;text-align:center;min-height:20px;margin-bottom:6px}
.adm-bar{position:fixed;bottom:20px;right:20px;z-index:150;display:none;gap:8px;align-items:center;flex-wrap:wrap;background:#2b211c;color:#fff;padding:10px 14px;border-radius:30px;box-shadow:0 4px 16px rgba(0,0,0,.35);font-weight:700;font-size:14px}
.adm-bar.show{display:flex}
.adm-bar button{border:none;border-radius:20px;padding:7px 14px;font-family:'Cairo',sans-serif;font-weight:700;font-size:13px;cursor:pointer}
.adm-bar .out{background:#d62828;color:#fff}
.adm-bar .seed{background:#FFE14D;color:#2b211c}
.editor{padding:10px 12px 12px;background:#fff8f0;border-top:2px dashed #ff6600;display:grid;gap:8px}
.editor label{font-size:12px;font-weight:700;color:#8a7b72}
.editor input[type=text],.editor input[type=number]{width:100%;padding:8px 10px;border:2px solid #ffd9bf;border-radius:10px;font-size:15px;font-family:'Cairo',sans-serif}
.editor .chk{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:#2b211c}
.editor .chk input{width:18px;height:18px}
.editor .save{background:#19A7B9;color:#fff;border:none;border-radius:20px;padding:9px;font-weight:800;font-size:15px;font-family:'Cairo',sans-serif;cursor:pointer}
.editor .save:disabled{opacity:.6}
.adm-toast{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#1e9e4a;color:#fff;padding:10px 22px;border-radius:24px;font-weight:800;z-index:300;box-shadow:0 4px 14px rgba(0,0,0,.3)}
.adm-toast.bad{background:#d62828}
`;
document.head.appendChild(style);

// ===== واجهة الدخول =====
const footer = document.querySelector(".site-footer");
const loginLink = document.createElement("button");
loginLink.className = "admin-link";
loginLink.textContent = "🔐 دخول الإدارة";
footer.appendChild(loginLink);

const overlay = document.createElement("div");
overlay.className = "adm-overlay";
overlay.innerHTML = `
<div class="adm-box">
  <h3>🔐 دخول الإدارة</h3>
  <input type="email" id="adm-email" placeholder="الإيميل" dir="ltr" autocomplete="username">
  <input type="password" id="adm-pass" placeholder="الباسورد" dir="ltr" autocomplete="current-password">
  <div class="adm-err" id="adm-err"></div>
  <button class="adm-btn" id="adm-go">دخول</button>
  <button class="adm-btn alt" id="adm-cancel">إلغاء</button>
</div>`;
document.body.appendChild(overlay);

const bar = document.createElement("div");
bar.className = "adm-bar";
document.body.appendChild(bar);

const $ = id => document.getElementById(id);
loginLink.onclick = () => { $("adm-err").textContent = ""; overlay.classList.add("show"); $("adm-email").focus(); };
$("adm-cancel").onclick = () => overlay.classList.remove("show");
overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.remove("show"); });

async function doLogin() {
    const btn = $("adm-go");
    btn.disabled = true;
    $("adm-err").textContent = "";
    try {
        await signInWithEmailAndPassword(auth, $("adm-email").value.trim(), $("adm-pass").value);
        $("adm-pass").value = "";
        overlay.classList.remove("show");
    } catch (e) {
        $("adm-err").textContent = "الإيميل أو الباسورد غلط";
    }
    btn.disabled = false;
}
$("adm-go").onclick = doLogin;
$("adm-pass").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });

function toast(msg, bad) {
    const t = document.createElement("div");
    t.className = "adm-toast" + (bad ? " bad" : "");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
}

function updateBar() {
    const on = !!window.__isAdmin;
    loginLink.style.display = on ? "none" : "";
    bar.classList.toggle("show", on);
    bar.innerHTML = "<span>✏️ وضع التعديل</span>";
    if (on && dbEmpty) {
        const s = document.createElement("button");
        s.className = "seed";
        s.textContent = "رفع المنتجات الحالية";
        s.onclick = seedProducts;
        bar.appendChild(s);
    }
    const o = document.createElement("button");
    o.className = "out";
    o.textContent = "خروج";
    o.onclick = () => signOut(auth);
    bar.appendChild(o);
}

// ===== رفع المنتجات الحالية أول مرة =====
async function seedProducts() {
    if (!confirm("رفع كل المنتجات الحالية لقاعدة البيانات؟")) return;
    try {
        const batch = writeBatch(db);
        (window.__seed || []).forEach((p, i) => {
            const clean = JSON.parse(JSON.stringify(p));
            clean.soldOut = !!clean.soldOut;
            clean.order = i;
            clean.updatedAt = Date.now();
            batch.set(doc(db, "products", "p" + String(i + 1).padStart(3, "0")), clean);
        });
        await batch.commit();
        toast("تم رفع المنتجات ✅");
    } catch (e) {
        console.error(e);
        toast("فشل الرفع، راجع الـ Rules", true);
    }
}

// ===== محرر المنتج داخل الكارت =====
const toEn = s => String(s).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace("٫", ".").replace("،", ".");

window.__editor = p => {
    const box = document.createElement("div");
    box.className = "editor";
    box.innerHTML = `
      <label>اسم المنتج</label>
      <input type="text" class="e-name">
      <label>السعر (جنيه)</label>
      <input type="number" step="0.01" inputmode="decimal" class="e-price">
      <label class="chk"><input type="checkbox" class="e-sold"> غير متوفر</label>
      <button class="save" type="button">💾 حفظ</button>`;
    box.querySelector(".e-name").value = p.name || "";
    box.querySelector(".e-price").value = p.price ?? "";
    box.querySelector(".e-sold").checked = !!p.soldOut;
    const btn = box.querySelector(".save");
    btn.onclick = async () => {
        const name = box.querySelector(".e-name").value.trim();
        const price = Number(toEn(box.querySelector(".e-price").value));
        if (!name || isNaN(price) || price < 0) { toast("اكتب اسم وسعر صحيح", true); return; }
        btn.disabled = true;
        try {
            await updateDoc(doc(db, "products", p.id), {
                name, price,
                soldOut: box.querySelector(".e-sold").checked,
                updatedAt: Date.now()
            });
            toast("تم الحفظ ✅");
        } catch (e) {
            console.error(e);
            toast("فشل الحفظ، تأكد إنك مسجل دخول", true);
        }
        btn.disabled = false;
    };
    return box;
};

// ===== قراءة المنتجات من Firestore =====
onSnapshot(collection(db, "products"), snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    dbEmpty = list.length === 0;
    if (!dbEmpty && window.__setProducts) window.__setProducts(list);
    updateBar();
}, err => console.warn("Firestore:", err));

onAuthStateChanged(auth, user => {
    window.__isAdmin = !!user;
    updateBar();
    if (window.__rerender) window.__rerender();
});
