import { db } from '../firebase/firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const youtubeList = document.getElementById('youtubeList');

async function loadVideos() {
  youtubeList.innerHTML = '<p>불러오는 중...</p>';
  const q = query(collection(db, 'youtube'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    youtubeList.innerHTML = '<p>등록된 영상이 없습니다.</p>';
    return;
  }

  youtubeList.innerHTML = '';
  snapshot.forEach(doc => {
    const { videoUrl = '', description = '' } = doc.data();
    const videoId = extractYoutubeId(videoUrl);
    if (!videoId) return;

    const item = document.createElement('div');
    item.className = 'video';
    item.innerHTML = `
      <iframe 
        src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" 
        allowfullscreen
        loading="lazy">
      </iframe>
      <p>${description}</p>
    `;
    youtubeList.appendChild(item);
  });
}

function extractYoutubeId(url) {
  const reg = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(reg);
  return match ? match[1] : '';
}

loadVideos();