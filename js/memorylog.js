import { db } from '../firebase/firebase.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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
    let index = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.style.animationDelay = `${index * 0.1}s`;
      
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3>${data.title}</h3>
          <p>${data.description}</p>
          <time>${data.createdAt?.toDate().toLocaleDateString() ?? ''}</time>
        </div>
      `;
      timeline.appendChild(item);
      index++;
    });

    observeTimelineItems();
    
  } catch (err) {
    timeline.innerHTML = '<p>타임라인 불러오기 실패</p>';
    console.error(err);
  }
}

function observeTimelineItems() {
  const items = document.querySelectorAll('.timeline-item');
  
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

loadTimeline();