import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
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
.adm-login{margin-right:auto;background:#ff6600;color:#fff;border:none;padding:8px 20px;border-radius:20px;font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;cursor:pointer;white-space:nowrap;transition:background .2s}
.adm-login:hover{background:#e65c00}
@media (max-width:600px){.adm-login{padding:6px 12px;font-size:13px}}
.adm-backdrop{position:fixed;inset:0;background:rgba(43,33,28,.5);opacity:0;pointer-events:none;transition:opacity .25s;z-index:210}
.adm-backdrop.show{opacity:1;pointer-events:auto}
.adm-panel{position:fixed;top:0;bottom:0;right:0;width:min(330px,88vw);background:#fff;z-index:220;transform:translateX(100%);transition:transform .28s ease;box-shadow:-8px 0 30px rgba(0,0,0,.3);display:flex;flex-direction:column}
.adm-panel.show{transform:translateX(0)}
.adm-head{background:#2b211c;color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;font-weight:800;font-size:18px;border-bottom:4px solid #ff6600}
.adm-head button{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1}
.adm-body{padding:22px 20px;overflow-y:auto}
.adm-body label{display:block;font-size:13px;font-weight:700;color:#8a7b72;margin-bottom:4px}
.adm-body input{width:100%;padding:12px 14px;margin-bottom:12px;border:2px solid #ffd9bf;border-radius:12px;font-size:16px;font-family:'Cairo',sans-serif;outline:none}
.adm-body input:focus{border-color:#19A7B9}
.adm-hint{font-size:14px;color:#5a3a24;margin-bottom:16px;line-height:1.7}
.adm-who{background:#fff1e6;border:1.5px solid #ff6600;color:#2b211c;border-radius:12px;padding:10px 14px;font-weight:800;text-align:center;margin-bottom:16px}
.adm-btn.green{background:#1e9e4a;margin-bottom:10px}
.adm-btn.teal{background:#19A7B9;margin-bottom:10px}
.adm-btn.red{background:#d62828}
.adm-overlay{position:fixed;inset:0;background:rgba(43,33,28,.65);display:none;align-items:center;justify-content:center;z-index:200;padding:16px}
.adm-overlay.show{display:flex}
.adm-box{background:#fff;border-radius:18px;padding:26px 22px;width:min(380px,100%);box-shadow:0 10px 40px rgba(0,0,0,.35);border-top:5px solid #ff6600}
.adm-box h3{text-align:center;font-size:22px;font-weight:800;color:#2b211c;margin-bottom:16px}
.adm-box input{width:100%;padding:12px 14px;margin-bottom:12px;border:2px solid #ffd9bf;border-radius:12px;font-size:16px;font-family:'Cairo',sans-serif;outline:none}
.adm-box input:focus{border-color:#19A7B9}
.adm-btn{width:100%;padding:12px;border:none;border-radius:24px;background:#ff6600;color:#fff;font-weight:800;font-size:16px;font-family:'Cairo',sans-serif;cursor:pointer}
.adm-btn.alt{background:#fff;color:#8a7b72;border:2px solid #ddd;margin-top:8px}
.adm-err{color:#d62828;font-size:14px;font-weight:700;text-align:center;min-height:20px;margin-bottom:6px}
.editor{padding:10px 12px 12px;background:#fff8f0;border-top:2px dashed #ff6600;display:grid;gap:8px}
.editor label{font-size:12px;font-weight:700;color:#8a7b72}
.editor input[type=text],.editor input[type=number]{width:100%;padding:8px 10px;border:2px solid #ffd9bf;border-radius:10px;font-size:15px;font-family:'Cairo',sans-serif}
.adm-box select{width:100%;padding:12px 14px;margin-bottom:12px;border:2px solid #ffd9bf;border-radius:12px;font-size:16px;font-family:'Cairo',sans-serif}
.adm-box label{display:block;font-size:13px;font-weight:700;color:#8a7b72;margin-bottom:4px}
.editor .chk{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:#2b211c}
.editor .chk input{width:18px;height:18px}
.editor .save{background:#19A7B9;color:#fff;border:none;border-radius:20px;padding:9px;font-weight:800;font-size:15px;font-family:'Cairo',sans-serif;cursor:pointer}
.editor .save:disabled{opacity:.6}
.editor input[type=file]{width:100%;font-size:13px;font-family:'Cairo',sans-serif}
.adm-prev{display:none;width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:10px;margin-bottom:12px;border:2px solid #ffd9bf}
.editor .del{background:#fff;color:#d62828;border:2px solid #d62828;border-radius:20px;padding:7px;font-weight:800;font-size:14px;font-family:'Cairo',sans-serif;cursor:pointer}
.editor .del:hover{background:#d62828;color:#fff}
.editor .del:disabled{opacity:.6}
.adm-toast{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#1e9e4a;color:#fff;padding:10px 22px;border-radius:24px;font-weight:800;z-index:300;box-shadow:0 4px 14px rgba(0,0,0,.3)}
.adm-toast.bad{background:#d62828}
`;
document.head.appendChild(style);

// ===== واجهة الدخول =====
const tab = document.createElement("button");
tab.className = "adm-login";
tab.type = "button";
(document.querySelector(".top-header") || document.body).appendChild(tab);

const backdrop = document.createElement("div");
backdrop.className = "adm-backdrop";
document.body.appendChild(backdrop);

const panel = document.createElement("aside");
panel.className = "adm-panel";
panel.innerHTML = `
<div class="adm-head"><span id="adm-title">🔐 تسجيل دخول المدير</span><button id="adm-close" type="button">✕</button></div>
<div class="adm-body">
  <div id="adm-login-view">
    <p class="adm-hint">سجّل دخولك لتعديل المنتجات والأسعار.</p>
    <label>الإيميل</label>
    <input type="email" id="adm-email" dir="ltr" autocomplete="username">
    <label>الباسورد</label>
    <input type="password" id="adm-pass" dir="ltr" autocomplete="current-password">
    <div class="adm-err" id="adm-err"></div>
    <button class="adm-btn" id="adm-go" type="button">دخول</button>
  </div>
  <div id="adm-user-view" style="display:none">
    <div class="adm-who">✏️ وضع التعديل مفعّل</div>
    <button class="adm-btn green" id="adm-add" type="button">➕ إضافة منتج</button>
    <button class="adm-btn red" id="adm-out" type="button">تسجيل خروج</button>
  </div>
</div>`;
document.body.appendChild(panel);

const catList = document.createElement("datalist");
catList.id = "cat-list";
document.body.appendChild(catList);
function refreshCats(list) {
    const cats = [...new Set(list.map(p => p.cat).filter(Boolean))];
    catList.innerHTML = cats.map(c => '<option value="' + c.replace(/"/g, "&quot;") + '">').join("");
}

const addOverlay = document.createElement("div");
addOverlay.className = "adm-overlay";
addOverlay.innerHTML = `
<div class="adm-box">
  <h3>➕ إضافة منتج جديد</h3>
  <label>اسم المنتج</label>
  <input type="text" id="add-name" placeholder="مثال: لبن كامل الدسم 1 لتر">
  <label>السعر (جنيه)</label>
  <input type="number" step="0.01" inputmode="decimal" id="add-price" placeholder="0">
  <label>القسم (اختار من الموجود أو اكتب قسم جديد)</label>
  <input type="text" id="add-cat" list="cat-list" placeholder="مثال: الألبان">
  <label>صورة المنتج (اختياري)</label>
  <input type="file" id="add-file" accept="image/*">
  <img id="add-prev" class="adm-prev" alt="">
  <div class="adm-err" id="add-err"></div>
  <button class="adm-btn" id="add-go">إضافة</button>
  <button class="adm-btn alt" id="add-cancel">إلغاء</button>
</div>`;
document.body.appendChild(addOverlay);


const $ = id => document.getElementById(id);
function openPanel() { $("adm-err").textContent = ""; panel.classList.add("show"); backdrop.classList.add("show"); }
function closePanel() { panel.classList.remove("show"); backdrop.classList.remove("show"); }
tab.onclick = openPanel;
backdrop.onclick = closePanel;
$("adm-close").onclick = closePanel;
$("adm-add").onclick = () => { closePanel(); openAdd(); };
$("adm-out").onclick = () => { signOut(auth); closePanel(); };

async function doLogin() {
    const btn = $("adm-go");
    btn.disabled = true;
    $("adm-err").textContent = "";
    try {
        await signInWithEmailAndPassword(auth, $("adm-email").value.trim(), $("adm-pass").value);
        $("adm-pass").value = "";
        closePanel();
    } catch (e) {
        $("adm-err").textContent = "الإيميل أو الباسورد غلط";
    }
    btn.disabled = false;
}
$("adm-go").onclick = doLogin;
$("adm-pass").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });

// بيصغّر الصورة ويحوّلها JPEG صغيرة (حوالي 30-80 كيلو) عشان تتخزن في Firestore
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const r = Math.min(1, 640 / img.width);
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * r);
            c.height = Math.round(img.height * r);
            const ctx = c.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            let out = c.toDataURL("image/jpeg", 0.78);
            if (out.length > 300000) out = c.toDataURL("image/jpeg", 0.6);
            resolve(out);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
        img.src = url;
    });
}

const toEn = s => String(s).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace("٫", ".").replace("،", ".");
let maxOrder = 0;
let addImageData = "";

$("add-file").onchange = async e => {
    const f = e.target.files[0];
    addImageData = "";
    $("add-prev").style.display = "none";
    if (!f) return;
    try {
        addImageData = await fileToDataUrl(f);
        $("add-prev").src = addImageData;
        $("add-prev").style.display = "block";
    } catch (err) {
        $("add-err").textContent = "الصورة دي مش مدعومة، جرّب صورة تانية";
    }
};

function openAdd() {
    ["add-name", "add-price", "add-cat", "add-file"].forEach(i => $(i).value = "");
    addImageData = "";
    $("add-prev").style.display = "none";
    $("add-err").textContent = "";
    addOverlay.classList.add("show");
    $("add-name").focus();
}
$("add-cancel").onclick = () => addOverlay.classList.remove("show");
addOverlay.addEventListener("click", e => { if (e.target === addOverlay) addOverlay.classList.remove("show"); });
$("add-go").onclick = async () => {
    const name = $("add-name").value.trim();
    const price = Number(toEn($("add-price").value));
    const cat = $("add-cat").value.trim();
    if (!name || !cat || $("add-price").value === "" || isNaN(price) || price < 0) {
        $("add-err").textContent = "اكتب الاسم والسعر والقسم";
        return;
    }
    const btn = $("add-go");
    btn.disabled = true;
    try {
        const data = { name, price, cat, soldOut: false, order: maxOrder + 1, updatedAt: Date.now() };
        if (addImageData) data.imageData = addImageData;
        await addDoc(collection(db, "products"), data);
        addOverlay.classList.remove("show");
        toast("تمت إضافة المنتج ✅");
    } catch (e) {
        console.error(e);
        $("add-err").textContent = "فشلت الإضافة، تأكد إنك مسجل دخول";
    }
    btn.disabled = false;
};

function toast(msg, bad) {
    const t = document.createElement("div");
    t.className = "adm-toast" + (bad ? " bad" : "");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
}

function updateBar() {
    const on = !!window.__isAdmin;
    const label = on ? "⚙️ لوحة المدير" : "🔐 تسجيل دخول المدير";
    tab.textContent = label;
    $("adm-title").textContent = label;
    $("adm-login-view").style.display = on ? "none" : "";
    $("adm-user-view").style.display = on ? "" : "none";
}

// ===== محرر المنتج داخل الكارت =====
window.__editor = p => {
    const box = document.createElement("div");
    box.className = "editor";
    box.innerHTML = `
      <label>اسم المنتج</label>
      <input type="text" class="e-name">
      <label>السعر (جنيه)</label>
      <input type="number" step="0.01" inputmode="decimal" class="e-price">
      <label>القسم</label>
      <input type="text" class="e-cat" list="cat-list">
      <label>تغيير الصورة (اختياري)</label>
      <input type="file" class="e-file" accept="image/*">
      <label class="chk"><input type="checkbox" class="e-sold"> غير متوفر</label>
      <button class="save" type="button">💾 حفظ</button>
      <button class="del" type="button">🗑️ حذف المنتج</button>`;
    box.querySelector(".e-name").value = p.name || "";
    box.querySelector(".e-price").value = p.price ?? "";
    box.querySelector(".e-cat").value = p.cat || "";
    box.querySelector(".e-sold").checked = !!p.soldOut;
    let newImg = "";
    box.querySelector(".e-file").onchange = async e => {
        const f = e.target.files[0];
        newImg = "";
        if (!f) return;
        try { newImg = await fileToDataUrl(f); toast("تم تجهيز الصورة، اضغط حفظ"); }
        catch (err) { toast("الصورة دي مش مدعومة", true); }
    };
    const btn = box.querySelector(".save");
    btn.onclick = async () => {
        const name = box.querySelector(".e-name").value.trim();
        const price = Number(toEn(box.querySelector(".e-price").value));
        const cat = box.querySelector(".e-cat").value.trim();
        if (!name || !cat || isNaN(price) || price < 0) { toast("اكتب اسم وسعر وقسم صحيح", true); return; }
        btn.disabled = true;
        try {
            const upd = {
                name, price, cat,
                soldOut: box.querySelector(".e-sold").checked,
                updatedAt: Date.now()
            };
            if (newImg) upd.imageData = newImg;
            await updateDoc(doc(db, "products", p.id), upd);
            toast("تم الحفظ ✅");
        } catch (e) {
            console.error(e);
            toast("فشل الحفظ، تأكد إنك مسجل دخول", true);
        }
        btn.disabled = false;
    };
    const del = box.querySelector(".del");
    del.onclick = async () => {
        if (!confirm("متأكد إنك عاوز تحذف \"" + (p.name || "") + "\"؟ مش هينفع ترجعه.")) return;
        del.disabled = true;
        try {
            await deleteDoc(doc(db, "products", p.id));
            toast("تم حذف المنتج 🗑️");
        } catch (e) {
            console.error(e);
            toast("فشل الحذف، تأكد إنك مسجل دخول", true);
            del.disabled = false;
        }
    };
    return box;
};

// ===== قراءة المنتجات من Firestore =====
onSnapshot(collection(db, "products"), snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    dbEmpty = list.length === 0;
    refreshCats(list);
    maxOrder = list.reduce((m, p) => Math.max(m, p.order ?? 0), 0);
    if (!dbEmpty && window.__setProducts) window.__setProducts(list);
    updateBar();
}, err => console.warn("Firestore:", err));

onAuthStateChanged(auth, user => {
    window.__isAdmin = !!user;
    updateBar();
    if (window.__rerender) window.__rerender();
});

updateBar();
