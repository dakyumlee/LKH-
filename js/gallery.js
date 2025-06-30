import { db } from '../firebase/firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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
    let index = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.style.animationDelay = `${index * 0.1}s`;
      
      item.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.caption}" loading="lazy">
        <div class="gallery-caption">
          <p>${data.caption}</p>
        </div>
      `;
      
      item.addEventListener('click', () => {
        openLightbox(data.imageUrl, data.caption);
      });
      
      galleryList.appendChild(item);
      index++;
    });

    observeGalleryItems();
    
  } catch (err) {
    galleryList.innerHTML = '<p>갤러리를 불러오는 데 실패했습니다.</p>';
    console.error(err);
  }
}

function observeGalleryItems() {
  const items = document.querySelectorAll('.gallery-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  items.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s ease';
    observer.observe(item);
  });
}

function openLightbox(imageUrl, caption) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-overlay">
      <div class="lightbox-content">
        <img src="${imageUrl}" alt="${caption}">
        <p>${caption}</p>
        <button class="lightbox-close">&times;</button>
      </div>
    </div>
  `;
  
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  const overlay = lightbox.querySelector('.lightbox-overlay');
  overlay.style.cssText = `
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    text-align: center;
  `;
  
  const img = lightbox.querySelector('img');
  img.style.cssText = `
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 8px;
  `;
  
  const caption_p = lightbox.querySelector('p');
  caption_p.style.cssText = `
    color: white;
    margin-top: 1rem;
    font-size: 1.1rem;
  `;
  
  const closeBtn = lightbox.querySelector('.lightbox-close');
  closeBtn.style.cssText = `
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
    width: auto;
    padding: 0;
    margin: 0;
  `;
  
  document.body.appendChild(lightbox);
  
  setTimeout(() => {
    lightbox.style.opacity = '1';
  }, 10);
  
  const closeLightbox = () => {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(lightbox);
    }, 300);
  };
  
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      document.removeEventListener('keydown', handleKeyPress);
    }
  };
  document.addEventListener('keydown', handleKeyPress);
}

loadGallery();