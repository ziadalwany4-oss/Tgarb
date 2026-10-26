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

// ===== التنسيق وزر الدخول الواضح =====
const style = document.createElement("style");
style.textContent = `
.adm-login{background:linear-gradient(135deg, #ff6600, #ff8800);color:#fff;border:none;padding:9px 18px;border-radius:20px;font-family:'Cairo',sans-serif;font-weight:800;font-size:14px;cursor:pointer;white-space:nowrap;box-shadow:0 4px 12px rgba(255,102,0,0.3);transition:transform .2s, background .2s;margin-right:auto;display:flex;align-items:center;gap:6px;}
.adm-login:hover{transform:translateY(-2px);background:linear-gradient(135deg, #e65c00, #e67700)}
@media (max-width:600px){.adm-login{padding:7px 12px;font-size:12px}}

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

/* ===== رسائل التنبيه الفخمة للمدير ===== */
.boss-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px); z-index: 1000; display: flex;
    align-items: center; justify-content: center; padding: 20px;
    opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
}
