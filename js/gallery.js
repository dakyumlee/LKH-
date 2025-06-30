import { db } from '../firebase/firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const galleryList = document.getElementById('galleryList');

async function loadGallery() {
  galleryList.innerHTML = '<p>불러오는 중...</p>';
  try {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      galleryList.innerHTML = '<p>아직 등록된 사진이 없습니다.</p>';
      return;
    }

    galleryList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.caption}">
        <p>${data.caption}</p>
      `;
      galleryList.appendChild(item);
    });
  } catch (err) {
    galleryList.innerHTML = '<p>갤러리를 불러오는 데 실패했습니다.</p>';
    console.error(err);
  }
}

loadGallery();
