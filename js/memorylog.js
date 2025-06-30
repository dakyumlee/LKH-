import { db } from '../firebase/firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const timeline = document.getElementById('timeline');

async function loadTimeline() {
  timeline.innerHTML = '<p>불러오는 중...</p>';
  try {
    const q = query(collection(db, 'memorylog'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      timeline.innerHTML = '<p>아직 등록된 타임라인 항목이 없습니다.</p>';
      return;
    }

    timeline.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <time>${data.createdAt?.toDate().toLocaleDateString() ?? ''}</time>
      `;
      timeline.appendChild(item);
    });
  } catch (err) {
    timeline.innerHTML = '<p>타임라인 불러오기 실패</p>';
    console.error(err);
  }
}

loadTimeline();
