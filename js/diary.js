import { db, auth } from '../firebase/firebase.js';
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

let isAdmin = false;

onAuthStateChanged(auth, (user) => {
  if (user && user.email === 'admin@kiheon.com') {
    isAdmin = true;
  }
  loadDiary();
});

const form = document.getElementById('diaryForm');
const title = document.getElementById('diaryTitle');
const text = document.getElementById('diaryText');
const list = document.getElementById('diaryList');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const diaryTitle = title.value.trim();
  const diaryText = text.value.trim();
  if (!diaryTitle || !diaryText) return;

  await addDoc(collection(db, 'diary'), {
    title: diaryTitle,
    text: diaryText,
    createdAt: serverTimestamp()
  });

  title.value = '';
  text.value = '';
  loadDiary();
});

async function loadDiary() {
  list.innerHTML = '<p>불러오는 중...</p>';
  const q = query(collection(db, 'diary'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  list.innerHTML = '';
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const item = document.createElement('div');
    item.className = 'diary-entry';
    item.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.text}</p>
      <time>${data.createdAt?.toDate().toLocaleDateString() ?? ''}</time>
      ${isAdmin ? `<button class="delete" data-id="${docSnap.id}" title="삭제">🗑️</button>` : ''}
    `;
    item.style.opacity = 0;
    list.appendChild(item);
    setTimeout(() => item.style.opacity = 1, 100);
  });

  if (isAdmin) {
    list.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await deleteDoc(doc(db, 'diary', id));
        loadDiary();
      });
    });
  }
}