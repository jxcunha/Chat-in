// === 1) Cole aqui a sua configuração do Firebase ===
const firebaseConfig = {
  apiKey: "AIzaSyAqKRgVySm-vGFMi_iE2HJqlDAofmEAKAI",
  authDomain: "listacompras-8b4b0.firebaseapp.com",
  databaseURL: "https://listacompras-8b4b0-default-rtdb.firebaseio.com",
  projectId: "listacompras-8b4b0",
  storageBucket: "listacompras-8b4b0.appspot.com",
  messagingSenderId: "729159542190",
  appId: "1:729159542190:web:bd0571be160cfd723a543f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// === 2) UI elements ===
const loginBar = document.getElementById('loginBar');
const displayNameInput = document.getElementById('displayName');
const familyCodeInput = document.getElementById('familyCode');
const enterBtn = document.getElementById('enterBtn');

const messagesEl = document.getElementById('messages');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const fileInput = document.getElementById('fileInput');
const userInfo = document.getElementById('userInfo');
const roomLabel = document.getElementById('roomLabel');

let currentRoom = null;
let currentUser = null;
let messagesRef = null;

// === 3) Simple state & helpers ===
function sanitize(s){ return (s || '').toString().trim(); }

function scrollToBottom(){
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderMessage(msg, isMe){
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (isMe ? 'me' : 'other');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (msg.imageUrl){
    const img = document.createElement('img');
    img.className = 'chat-image';
    img.src = msg.imageUrl;
    img.alt = msg.text || 'imagem';
    bubble.appendChild(img);
    if (msg.text){
      const t = document.createElement('div');
      t.textContent = msg.text;
      bubble.appendChild(t);
    }
  } else {
    bubble.textContent = msg.text || '';
  }

  const meta = document.createElement('div');
  const time = new Date(msg.createdAt || Date.now());
  const hh = time.getHours().toString().padStart(2,'0');
  const mm = time.getMinutes().toString().padStart(2,'0');
  meta.className = 'meta';
  meta.textContent = (msg.name || 'Alguém') + ' — ' + hh + ':' + mm;

  wrap.appendChild(bubble);
  wrap.appendChild(meta);
  messagesEl.appendChild(wrap);
}

function startRoom(roomCode){
  if (messagesRef){
    messagesRef.off();
  }
  currentRoom = 'rooms/' + roomCode + '/messages';
  messagesRef = db.ref(currentRoom).limitToLast(200);
  roomLabel.textContent = 'Sala: ' + roomCode;

  messagesEl.innerHTML = '';
  messagesRef.on('child_added', (snap) => {
    const msg = snap.val() || {};
    renderMessage(msg, currentUser && msg.uid === currentUser.uid);
    scrollToBottom();
  });
}

async function sendText(){
  const text = sanitize(textInput.value);
  if (!text) return;
  textInput.value = '';
  const payload = {
    uid: currentUser ? currentUser.uid : null,
    name: localStorage.getItem('displayName') || 'Visitante',
    text,
    createdAt: Date.now()
  };
  await db.ref(currentRoom).push(payload);
}

async function sendImage(file){
  if (!file) return;
  const name = localStorage.getItem('displayName') || 'Visitante';
  const uid = currentUser ? currentUser.uid : null;
  const ts = Date.now();
  const path = `uploads/${uid || 'anon'}/${ts}_${file.name}`;
  const snap = await storage.ref().child(path).put(file);
  const url = await snap.ref.getDownloadURL();
  const payload = { uid, name, imageUrl: url, createdAt: ts };
  await db.ref(currentRoom).push(payload);
}

// === 4) Auth + Enter flow (anonymous) ===
enterBtn.addEventListener('click', async () => {
  const name = sanitize(displayNameInput.value);
  const code = sanitize(familyCodeInput.value).toUpperCase();
  if (!name || !code){
    alert('Informe seu nome e o código da família (ex: PORTILHO).');
    return;
  }
  localStorage.setItem('displayName', name);
  localStorage.setItem('familyCode', code);

  try{
    const cred = await auth.signInAnonymously();
    currentUser = cred.user;
    userInfo.textContent = name;
    loginBar.style.display = 'none';
    startRoom(code);
    textInput.focus();
  }catch(e){
    alert('Erro ao entrar: ' + e.message);
  }
});

auth.onAuthStateChanged((u) => {
  currentUser = u;
  const savedName = localStorage.getItem('displayName');
  const savedCode = localStorage.getItem('familyCode');
  if (u && savedName && savedCode){
    userInfo.textContent = savedName;
    loginBar.style.display = 'none';
    startRoom(savedCode);
  }
});

// === 5) Events ===
sendBtn.addEventListener('click', sendText);
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendText();
});
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) sendImage(file);
  fileInput.value = '';
});