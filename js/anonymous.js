import { db, auth } from '../firebase/firebase.js';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

let isAdmin = false;

onAuthStateChanged(auth, (user) => {
  if (user && user.email === 'admin@kiheon.com') {
    isAdmin = true;
  }
  loadMessages();
});

const form = document.getElementById('anonForm');
const textarea = document.getElementById('anonText');
const list = document.getElementById('anonList');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = textarea.value.trim();
  if (!text) return;

  await addDoc(collection(db, 'anonymous'), {
    text,
    createdAt: serverTimestamp()
  });

  textarea.value = '';
  loadMessages();
});

async function loadMessages() {
  list.innerHTML = '<p>불러오는 중...</p>';
  const q = query(collection(db, 'anonymous'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  list.innerHTML = '';
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement('div');
    div.className = 'anon-msg';
    div.innerHTML = `
      <p>${data.text}</p>
      <time>${data.createdAt?.toDate().toLocaleString() ?? ''}</time>
      ${isAdmin ? `<button class="delete" data-id="${docSnap.id}" title="삭제">🗑️</button>` : ''}
    `;
    div.style.opacity = 0;
    list.appendChild(div);
    setTimeout(() => div.style.opacity = 1, 100);
  });

  if (isAdmin) {
    list.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await deleteDoc(doc(db, 'anonymous', id));
        loadMessages();
      });
    });
  }
}