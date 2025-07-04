import { db } from '../firebase/firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const blogList = document.getElementById('blogList');

async function loadBlogs() {
  blogList.innerHTML = '<p>불러오는 중...</p>';
  try {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      blogList.innerHTML = '<p>아직 글이 없습니다.</p>';
      return;
    }

    blogList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('article');
      item.className = 'blog-post';
      
      let imagesHtml = '';
      if (data.images && data.images.length > 0) {
        imagesHtml = `
          <div class="blog-images">
            ${data.images.map(url => `<img src="${url}" alt="blog image" loading="lazy">`).join('')}
          </div>
        `;
      }
      
      item.innerHTML = `
        <h3>${data.title}</h3>
        ${imagesHtml}
        <p>${data.content}</p>
        <time>${data.createdAt?.toDate().toLocaleString() ?? ''}</time>
      `;
      blogList.appendChild(item);
    });
  } catch (err) {
    blogList.innerHTML = '<p>글을 불러오는 데 실패했습니다.</p>';
    console.error(err);
  }
}

loadBlogs();