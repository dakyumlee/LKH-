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
        <div class="lightbox-image-container">
          <img src="${imageUrl}" alt="${caption}">
        </div>
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
    max-width: 95vw;
    max-height: 95vh;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;
  
  const imageContainer = lightbox.querySelector('.lightbox-image-container');
  imageContainer.style.cssText = `
    max-width: 95vw;
    max-height: 85vh;
    overflow: auto;
    border-radius: 8px;
    background: #222;
    position: relative;
  `;
  
  const img = lightbox.querySelector('img');
  img.style.cssText = `
    display: block;
    max-width: none;
    height: auto;
    min-width: 100%;
    border-radius: 8px;
  `;
  
  img.onload = () => {
    const containerRect = imageContainer.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    
    if (img.naturalWidth > containerRect.width || img.naturalHeight > containerRect.height) {
      img.style.maxWidth = 'none';
      img.style.width = 'auto';
      img.style.height = 'auto';
      
      if (img.naturalWidth < containerRect.width) {
        img.style.width = '100%';
      }
      if (img.naturalHeight < containerRect.height) {
        img.style.height = '100%';
      }
    } else {
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.objectFit = 'contain';
    }
  };
  
  const caption_p = lightbox.querySelector('p');
  caption_p.style.cssText = `
    color: white;
    margin-top: 1rem;
    font-size: 1.1rem;
    max-width: 95vw;
    word-wrap: break-word;
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
    padding: 5px;
    margin: 0;
    z-index: 1001;
  `;
  
  document.body.appendChild(lightbox);
  
  setTimeout(() => {
    lightbox.style.opacity = '1';
  }, 10);
  
  const closeLightbox = () => {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(lightbox)) {
        document.body.removeChild(lightbox);
      }
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
  
  if (!document.querySelector('#lightbox-scroll-styles')) {
    const scrollStyles = document.createElement('style');
    scrollStyles.id = 'lightbox-scroll-styles';
    scrollStyles.textContent = `
      .lightbox-image-container::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .lightbox-image-container::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }
      
      .lightbox-image-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      }
      
      .lightbox-image-container::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
      
      .lightbox-image-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(scrollStyles);
  }
}

loadGallery();