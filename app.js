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
const enterBtn = document.getElementById('enterBtn');

const messagesEl = document.getElementById('messages');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const fileInput = document.getElementById('fileInput');
const userInfo = document.getElementById('userInfo');
const roomLabel = document.getElementById('roomLabel');
const contactForm = document.getElementById('contactForm');
const contactUidInput = document.getElementById('contactUid');
const contactNameInput = document.getElementById('contactName');
const contactsList = document.getElementById('contactsList');

let currentRoom = null;
let currentUser = null;
let messagesRef = null;
let contactsRef = null;
let selectedContact = null;

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
  messagesEl.innerHTML = '';
  messagesRef.on('child_added', (snap) => {
    const msg = snap.val() || {};
    renderMessage(msg, currentUser && msg.uid === currentUser.uid);
    scrollToBottom();
  });
}

async function sendText(){
  const text = sanitize(textInput.value);
  if (!text || !currentRoom) return;
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
  if (!file || !currentRoom) return;
  const name = localStorage.getItem('displayName') || 'Visitante';
  const uid = currentUser ? currentUser.uid : null;
  const ts = Date.now();
  const path = `uploads/${uid || 'anon'}/${ts}_${file.name}`;
  const snap = await storage.ref().child(path).put(file);
  const url = await snap.ref.getDownloadURL();
  const payload = { uid, name, imageUrl: url, createdAt: ts };
  await db.ref(currentRoom).push(payload);
}

// === Contacts management ===
function listenContacts(){
  if (!currentUser) return;
  if (contactsRef) contactsRef.off();
  contactsRef = db.ref(`users/${currentUser.uid}/contacts`);
  contactsRef.on('value', (snap) => {
    const data = snap.val() || {};
    contactsList.innerHTML = '';
    Object.entries(data).forEach(([uid, info]) => {
      const li = document.createElement('li');
      li.textContent = info.name || uid;
      li.dataset.uid = uid;
      li.className = 'contact' + (uid === selectedContact ? ' selected' : '');
      li.addEventListener('click', () => selectContact(uid, info.name));
      contactsList.appendChild(li);
    });
    if (!selectedContact){
      const last = localStorage.getItem('lastContact');
      if (last && data[last]){
        selectContact(last, data[last].name);
      }
    }
  });
}

function selectContact(uid, name){
  selectedContact = uid;
  document.querySelectorAll('#contactsList li').forEach(li => {
    li.classList.toggle('selected', li.dataset.uid === uid);
  });
  const roomId = [currentUser.uid, uid].sort().join('_');
  roomLabel.textContent = 'Contato: ' + (name || uid);
  localStorage.setItem('lastContact', uid);
  startRoom(roomId);
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const uid = sanitize(contactUidInput.value);
  const name = sanitize(contactNameInput.value);
  if (!uid || !name || !currentUser) return;
  await db.ref(`users/${currentUser.uid}/contacts/${uid}`).set({ name });
  contactUidInput.value = '';
  contactNameInput.value = '';
});

// === 4) Auth + Enter flow (anonymous) ===
enterBtn.addEventListener('click', async () => {
  const name = sanitize(displayNameInput.value);
  if (!name){
    alert('Informe seu nome.');
    return;
  }
  localStorage.setItem('displayName', name);

  try{
    const cred = await auth.signInAnonymously();
    currentUser = cred.user;
    await db.ref('users/' + currentUser.uid).update({ displayName: name });
    userInfo.textContent = name;
    loginBar.style.display = 'none';
    listenContacts();
    textInput.focus();
  }catch(e){
    alert('Erro ao entrar: ' + e.message);
  }
});

auth.onAuthStateChanged((u) => {
  currentUser = u;
  const savedName = localStorage.getItem('displayName');
  if (u && savedName){
    userInfo.textContent = savedName;
    loginBar.style.display = 'none';
    listenContacts();
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