import { db, storage, auth } from '../firebase/firebase.js';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy, 
  query,
  setDoc,
  limit
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";
import { 
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
 
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== '71karamm@gmail.com') {
    alert('관리자 권한이 필요합니다.');
    window.location.href = 'login.html';
  } else {
    console.log('관리자 로그인 확인됨');
    loadAllData();
  }
});

window.logout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    try {
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  }
};

window.showSection = (sectionName) => {
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.remove('active');
  });
   
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById(`${sectionName}-section`).classList.add('active');
  event.target.classList.add('active');
  
  loadSectionData(sectionName);
};
 
async function loadAllData() {
  await loadStats();
  await loadSectionData('blog');  
}
 
async function loadStats() {
  const stats = {
    blogs: 0,
    gallery: 0,
    youtube: 0,
    diary: 0,
    anonymous: 0,
    memorylog: 0,
    music: 0
  };

  try {
    const collections = ['blogs', 'gallery', 'youtube', 'diary', 'anonymous', 'memorylog', 'music'];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      stats[collectionName] = snapshot.size;
    }
    
    document.getElementById('stats').innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${stats.blogs}</div>
        <div class="stat-label">블로그</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.gallery}</div>
        <div class="stat-label">갤러리</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.youtube}</div>
        <div class="stat-label">YouTube</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.diary}</div>
        <div class="stat-label">일기</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.anonymous}</div>
        <div class="stat-label">익명메시지</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.memorylog}</div>
        <div class="stat-label">타임라인</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.music}</div>
        <div class="stat-label">음악</div>
      </div>
    `;
  } catch (error) {
    console.error('통계 로드 실패:', error);
  }
}
 
async function loadSectionData(sectionName) {
  switch(sectionName) {
    case 'blog':
      await loadBlogs();
      break;
    case 'gallery':
      await loadGalleryManage();
      break;
    case 'youtube':
      await loadYouTubeManage();
      break;
    case 'diary':
      await loadDiaryManage();
      break;
    case 'anonymous':
      await loadAnonymousManage();
      break;
    case 'memorylog':
      await loadMemorylogManage();
      break;
    case 'music':
      await loadMusicManage();
      break;
  }
}

async function loadBlogs() {
  const container = document.getElementById('blogList');
  container.innerHTML = '<p>블로그를 불러오는 중...</p>';
  
  try {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p>작성된 블로그가 없습니다.</p>';
      return;
    }
    
    container.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const item = document.createElement('div');
      item.className = 'content-item';
      
      let imagesHtml = '';
      if (data.images && data.images.length > 0) {
        imagesHtml = data.images.map(url => `<img src="${url}" alt="blog image">`).join('');
      }
      
      item.innerHTML = `
        <h4>${data.title}</h4>
        ${imagesHtml}
        <p>${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}</p>
        <time>${data.createdAt?.toDate().toLocaleDateString('ko-KR') ?? ''}</time>
        <button class="delete-btn" onclick="deleteBlog('${docSnap.id}')">삭제</button>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('블로그 로드 실패:', error);
    container.innerHTML = '<p>블로그를 불러오는데 실패했습니다.</p>';
  }
}

async function loadGalleryManage() {
  const container = document.getElementById('galleryManageList');
  container.innerHTML = '<p>갤러리를 불러오는 중...</p>';
  
  try {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p>등록된 사진이 없습니다.</p>';
      return;
    }
    
    container.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const item = document.createElement('div');
      item.className = 'content-item';
      item.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.caption}">
        <h4>사진</h4>
        <p>${data.caption}</p>
        <time>${data.createdAt?.toDate().toLocaleDateString('ko-KR') ?? ''}</time>
        <button class="delete-btn" onclick="deleteGallery('${docSnap.id}', '${data.imageUrl}')">삭제</button>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('갤러리 로드 실패:', error);
    container.innerHTML = '<p>갤러리를 불러오는데 실패했습니다.</p>';
  }
}

async function loadYouTubeManage() {
  const container = document.getElementById('youtubeManageList');
  container.innerHTML = '<p>YouTube 영상을 불러오는 중...</p>';
  
  try {
    const q = query(collection(db, 'youtube'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p>등록된 영상이 없습니다.</p>';
      return;
    }
    
    container.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const videoId = extractYoutubeId(data.videoUrl);
      const item = document.createElement('div');
      item.className = 'content-item';
      item.innerHTML = `
        ${videoId ? `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>` : ''}
        <h4>YouTube 영상</h4>
        <p>${data.description}</p>
        <p><a href="${data.videoUrl}" target="_blank">${data.videoUrl}</a></p>
        <time>${data.createdAt?.toDate().toLocaleDateString('ko-KR') ?? ''}</time>
        <button class="delete-btn" onclick="deleteYouTube('${docSnap.id}')">삭제</button>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('YouTube 로드 실패:', error);
    container.innerHTML = '<p>YouTube 영상을 불러오는데 실패했습니다.</p>';
  }
}

async function loadDiaryManage() {
  const container = document.getElementById('diaryManageList');
  container.innerHTML = '<p>일기를 불러오는 중...</p>';
  
  try {
    const q = query(collection(db, 'diary'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p>작성된 일기가 없습니다.</p>';
      return;
    }
    
    container.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const item = document.createElement('div');
      item.className = 'content-item';
      item.innerHTML = `
        <h4>${data.title}</h4>
        <p>${data.text.substring(0, 100)}${data.text.length > 100 ? '...' : ''}</p>
        <time>${data.createdAt?.toDate().toLocaleDateString('ko-KR') ?? ''}</time>
        <button class="delete-btn" onclick="deleteDiary('${docSnap.id}')">삭제</button>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('일기 로드 실패:', error);
    container.innerHTML = '<p>일기를 불러오는데 실패했습니다.</p>';
  }
}

async function loadAnonymousManage() {
  const container = document.getElementById('anonymousManageList');
  container.innerHTML = '<p>익명메시지를 불러오는 중...</p>';
  
  try {
    const q = query(collection(db, 'anonymous'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p>익명메시지가 없습니다.</p>';
      return;
    }
    
    container.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const item = document.createElement('div');
      item.className = 'content-item';
      item.innerHTML = `
        <h4>익명메시지</h4>
        <p>${data.text}</p>
        <time>${data.createdAt?.toDate().toLocaleDateString('ko-KR') ?? ''}</time>
        <button class="delete-btn" onclick="deleteAnonymous('${docSnap.id}')">삭제</button>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('익명메시지 로드 실패:', error);
    container.innerHTML = '<p>익명메시지를 불러오는데 실패했습니다.</p>';
  }
}

async function loadMemorylogManage() {
  const container = document.getElementById('memorylogManageList');
  container.innerHTML = '<p>타임라인을 불러오는 중...</p>';
  
  try {
    const q = query(collection(db, 'memorylog'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = '<p>타임라인 항목이 없습니다.</p>';
      return;
    }
    
    container.innerHTML = '';
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const item = document.createElement('div');
      item.className = 'content-item';
      item.innerHTML = `
        <h4>${data.title}</h4>
        <p>${data.description}</p>
        <time>${data.createdAt?.toDate().toLocaleDateString('ko-KR') ?? ''}</time>
        <button class="delete-btn" onclick="deleteMemorylog('${docSnap.id}')">삭제</button>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('타임라인 로드 실패:', error);
    container.innerHTML = '<p>타임라인을 불러오는데 실패했습니다.</p>';
  }
}

async function loadMusicManage() {
  const currentContainer = document.getElementById('currentMusic');
  const historyContainer = document.getElementById('musicHistory');
  
  try {
    const currentQ = query(collection(db, 'music'), orderBy('createdAt', 'desc'), limit(1));
    const currentSnap = await getDocs(currentQ);
    
    if (currentSnap.empty) {
      currentContainer.innerHTML = '<p>설정된 음악이 없습니다.</p>';
    } else {
      const data = currentSnap.docs[0].data();
      const videoId = extractYoutubeId(data.url);
      currentContainer.innerHTML = `
        <div class="current-music">
          <h4>${data.title} - ${data.artist}</h4>
          ${videoId ? `<iframe width="300" height="169" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>` : ''}
          <p>${data.description}</p>
          <time>${data.createdAt?.toDate().toLocaleDateString('ko-KR') ?? ''}</time>
          <button class="delete-btn" onclick="deleteMusic('${currentSnap.docs[0].id}')">삭제</button>
        </div>
      `;
    }
    
    const historyQ = query(collection(db, 'music'), orderBy('createdAt', 'desc'));
    const historySnap = await getDocs(historyQ);
    
    historyContainer.innerHTML = '';
    historySnap.forEach(docSnap => {
      const data = docSnap.data();
      const item = document.createElement('div');
      item.className = 'content-item';
      item.innerHTML = `
        <h4>${data.title} - ${data.artist}</h4>
        <p>${data.description}</p>
        <time>${data.createdAt?.toDate().toLocaleDateString('ko-KR') ?? ''}</time>
        <button class="delete-btn" onclick="deleteMusic('${docSnap.id}')">삭제</button>
      `;
      historyContainer.appendChild(item);
    });
  } catch (error) {
    console.error('음악 로드 실패:', error);
    currentContainer.innerHTML = '<p>음악을 불러오는데 실패했습니다.</p>';
  }
}

window.deleteBlog = async (id) => {
  if (confirm('이 블로그 글을 삭제하시겠습니까?')) {
    try {
      await deleteDoc(doc(db, 'blogs', id));
      alert('블로그 글이 삭제되었습니다.');
      loadBlogs();
      loadStats();
    } catch (error) {
      console.error('블로그 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  }
};

window.deleteGallery = async (id, imageUrl) => {
  if (confirm('이 사진을 삭제하시겠습니까?')) {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (storageError) {
        console.log('Storage 이미지 삭제 실패 (이미 삭제되었을 수 있음):', storageError);
      }
      
      alert('사진이 삭제되었습니다.');
      loadGalleryManage();
      loadStats();
    } catch (error) {
      console.error('갤러리 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  }
};

window.deleteYouTube = async (id) => {
  if (confirm('이 YouTube 영상을 삭제하시겠습니까?')) {
    try {
      await deleteDoc(doc(db, 'youtube', id));
      alert('YouTube 영상이 삭제되었습니다.');
      loadYouTubeManage();
      loadStats();
    } catch (error) {
      console.error('YouTube 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  }
};

window.deleteDiary = async (id) => {
  if (confirm('이 일기를 삭제하시겠습니까?')) {
    try {
      await deleteDoc(doc(db, 'diary', id));
      alert('일기가 삭제되었습니다.');
      loadDiaryManage();
      loadStats();
    } catch (error) {
      console.error('일기 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  }
};

window.deleteAnonymous = async (id) => {
  if (confirm('이 익명메시지를 삭제하시겠습니까?')) {
    try {
      await deleteDoc(doc(db, 'anonymous', id));
      alert('익명메시지가 삭제되었습니다.');
      loadAnonymousManage();
      loadStats();
    } catch (error) {
      console.error('익명메시지 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  }
};

window.deleteMemorylog = async (id) => {
  if (confirm('이 타임라인 항목을 삭제하시겠습니까?')) {
    try {
      await deleteDoc(doc(db, 'memorylog', id));
      alert('타임라인 항목이 삭제되었습니다.');
      loadMemorylogManage();
      loadStats();
    } catch (error) {
      console.error('타임라인 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  }
};

window.deleteMusic = async (id) => {
  if (confirm('이 음악을 삭제하시겠습니까?')) {
    try {
      await deleteDoc(doc(db, 'music', id));
      alert('음악이 삭제되었습니다.');
      loadMusicManage();
      loadStats();
    } catch (error) {
      console.error('음악 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  }
};

function extractYoutubeId(url) {
  const reg = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(reg);
  return match ? match[1] : '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('blogTitle').value.trim();
    const content = document.getElementById('blogContent').value.trim();
    const imageFiles = document.getElementById('blogImages').files;
    
    if (!title || !content) return alert('제목과 내용을 입력하세요');
    
    try {
      const imageUrls = [];
      
      if (imageFiles.length > 0) {
        for (let file of imageFiles) {
          const fileRef = ref(storage, `blog/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(snapshot.ref);
          imageUrls.push(url);
        }
      }
      
      await addDoc(collection(db, 'blogs'), {
        title,
        content,
        images: imageUrls,
        createdAt: serverTimestamp()
      });
      
      alert('블로그 글이 업로드되었습니다.');
      document.getElementById('blogForm').reset();
      document.getElementById('blogImagePreview').innerHTML = '';
      loadBlogs();
      loadStats();
    } catch (error) {
      console.error('블로그 업로드 실패:', error);
      alert('업로드에 실패했습니다.');
    }
  });

  document.getElementById('galleryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('imageFile').files[0];
    const caption = document.getElementById('caption').value.trim();
    if (!file || !caption) return alert('파일과 설명을 입력하세요');

    try {
      const fileRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'gallery'), {
        imageUrl: url,
        caption,
        createdAt: serverTimestamp()
      });
      alert('사진이 업로드되었습니다.');
      document.getElementById('galleryForm').reset();
      loadGalleryManage();
      loadStats();
    } catch (error) {
      console.error('갤러리 업로드 실패:', error);
      alert('업로드에 실패했습니다.');
    }
  });

  document.getElementById('youtubeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const videoUrl = document.getElementById('videoUrl').value.trim();
    const videoDesc = document.getElementById('videoDesc').value.trim();
    if (!videoUrl || !videoDesc) return alert('링크와 설명을 입력하세요');

    try {
      await addDoc(collection(db, 'youtube'), {
        videoUrl,
        description: videoDesc,
        createdAt: serverTimestamp()
      });
      alert('YouTube 영상이 추가되었습니다.');
      document.getElementById('youtubeForm').reset();
      loadYouTubeManage();
      loadStats();
    } catch (error) {
      console.error('YouTube 업로드 실패:', error);
      alert('업로드에 실패했습니다.');
    }
  });

  document.getElementById('diaryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('diaryTitle').value.trim();
    const content = document.getElementById('diaryContent').value.trim();
    if (!title || !content) return alert('제목과 내용을 입력하세요');

    try {
      await addDoc(collection(db, 'diary'), {
        title,
        text: content,
        createdAt: serverTimestamp()
      });
      alert('일기가 작성되었습니다.');
      document.getElementById('diaryForm').reset();
      loadDiaryManage();
      loadStats();
    } catch (error) {
      console.error('일기 작성 실패:', error);
      alert('작성에 실패했습니다.');
    }
  });

  document.getElementById('memorylogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('memorylogTitle').value.trim();
    const description = document.getElementById('memorylogDesc').value.trim();
    if (!title || !description) return alert('제목과 설명을 입력하세요');

    try {
      await addDoc(collection(db, 'memorylog'), {
        title,
        description,
        createdAt: serverTimestamp()
      });
      alert('타임라인이 추가되었습니다.');
      document.getElementById('memorylogForm').reset();
      loadMemorylogManage();
      loadStats();
    } catch (error) {
      console.error('타임라인 추가 실패:', error);
      alert('추가에 실패했습니다.');
    }
  });

  document.getElementById('musicForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('musicTitle').value.trim();
    const artist = document.getElementById('musicArtist').value.trim();
    const url = document.getElementById('musicUrl').value.trim();
    const description = document.getElementById('musicDescription').value.trim();
    
    if (!title || !artist || !url) return alert('제목, 아티스트, 링크를 입력하세요');

    try {
      await addDoc(collection(db, 'music'), {
        title,
        artist,
        url,
        description,
        createdAt: serverTimestamp()
      });
      alert('오늘의 음악이 설정되었습니다.');
      document.getElementById('musicForm').reset();
      document.getElementById('musicPreview').style.display = 'none';
      loadMusicManage();
      loadStats();
    } catch (error) {
      console.error('음악 설정 실패:', error);
      alert('설정에 실패했습니다.');
    }
  });
});