import { db, storage, auth } from '../firebase/firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert('로그인이 필요합니다');
    window.location.href = 'login.html';
  }
});


const blogForm = document.getElementById('blogForm');
blogForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  if (!title || !content) return alert('제목과 내용을 입력하세요');
  await addDoc(collection(db, 'blogs'), {
    title,
    content,
    createdAt: serverTimestamp()
  });
  alert('업로드 완료');
  blogForm.reset();
});

const galleryForm = document.getElementById('galleryForm');
galleryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = document.getElementById('imageFile').files[0];
  const caption = document.getElementById('caption').value.trim();
  if (!file || !caption) return alert('파일과 설명을 입력하세요');

  const fileRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(snapshot.ref);

  await addDoc(collection(db, 'gallery'), {
    imageUrl: url,
    caption,
    createdAt: serverTimestamp()
  });
  alert('사진 업로드 완료');
  galleryForm.reset();
});

const youtubeForm = document.getElementById('youtubeForm');
youtubeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const videoUrl = document.getElementById('videoUrl').value.trim();
  const videoDesc = document.getElementById('videoDesc').value.trim();
  if (!videoUrl || !videoDesc) return alert('링크와 설명을 입력하세요');

  await addDoc(collection(db, 'youtube'), {
    videoUrl,
    description: videoDesc,
    createdAt: serverTimestamp()
  });
  alert('영상 업로드 완료');
  youtubeForm.reset();
});
