import { db, auth } from '../firebase/firebase.js';
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

let isAdmin = false;
let editingId = null;

onAuthStateChanged(auth, (user) => {
  if (user && user.email === '71karamm@gmail.com') {
    isAdmin = true;
  }
  loadDiary();
});

const list = document.getElementById('diaryList');

async function loadDiary() {
  list.innerHTML = '<div class="loading">일기를 불러오는 중</div>';
  
  try {
    const q = query(collection(db, 'diary'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      list.innerHTML = '<div class="empty-state">아직 작성된 일기가 없습니다</div>';
      return;
    }
    
    list.innerHTML = '';
    let index = 0;
    
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const item = document.createElement('div');
      item.className = 'diary-entry';
      item.style.animationDelay = `${index * 0.1}s`;
      
      const preview = data.text.length > 200 ? 
        data.text.substring(0, 200) + '...' : 
        data.text;
      
      const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        });
      };
      
      item.innerHTML = `
        <h3>${data.title}</h3>
        <p>${preview}</p>
        <time>${formatDate(data.createdAt)}</time>
        ${isAdmin ? `
          <div class="admin-buttons">
            <button class="edit" data-id="${docSnap.id}" data-title="${data.title}" data-text="${data.text}" title="수정">✏️</button>
            <button class="delete" data-id="${docSnap.id}" title="삭제">🗑️</button>
          </div>
        ` : ''}
      `;
      
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      
      list.appendChild(item);
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.style.transition = 'all 0.6s ease';
      }, index * 100);
      
      index++;
    });

    if (isAdmin) {
      list.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const id = e.target.dataset.id;
          
          openAdminAuthModal('delete', id);
        });
      });

      list.querySelectorAll('.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = e.target.dataset.id;
          const title = e.target.dataset.title;
          const text = e.target.dataset.text;
          
          openAdminAuthModal('edit', id, title, text);
        });
      });
    }
    
    observeDiaryEntries();
    
  } catch (error) {
    console.error('일기 로드 실패:', error);
    list.innerHTML = '<div class="empty-state">일기를 불러오는데 실패했습니다</div>';
  }
}

function openAdminAuthModal(action, id, title = '', text = '') {
  const modal = document.createElement('div');
  modal.className = 'admin-auth-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>관리자 인증</h3>
      <p class="auth-message">${action === 'delete' ? '삭제' : '수정'} 권한이 필요합니다</p>
      <input type="email" id="adminEmail" value="71karamm@gmail.com" placeholder="관리자 이메일" readonly>
      <input type="password" id="adminPassword" placeholder="비밀번호" autofocus>
      <div class="modal-buttons">
        <button onclick="authenticateAdmin('${action}', '${id}', '${title}', '${text}')">인증</button>
        <button onclick="closeAdminAuthModal()">취소</button>
      </div>
      <div class="auth-alternative">
        <button class="admin-page-btn" onclick="goToAdminPage()">관리자 페이지로 이동</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAdminAuthModal();
    }
  });
  
  document.addEventListener('keydown', handleAuthEscapeKey);
  
  const passwordInput = document.getElementById('adminPassword');
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      authenticateAdmin(action, id, title, text);
    }
  });
}

window.authenticateAdmin = async (action, id, title, text) => {
  const password = document.getElementById('adminPassword').value.trim();
  
  if (!password) {
    alert('비밀번호를 입력하세요');
    return;
  }
  
  try {
    const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js");
    
    await signInWithEmailAndPassword(auth, '71karamm@gmail.com', password);
    
    closeAdminAuthModal();
    
    if (action === 'delete') {
      if (confirm('이 일기를 삭제하시겠습니까?')) {
        try {
          await deleteDoc(doc(db, 'diary', id));
          const entryElement = document.querySelector(`[data-id="${id}"]`).closest('.diary-entry');
          entryElement.style.animation = 'fadeOut 0.3s ease forwards';
          
          setTimeout(() => {
            loadDiary();
          }, 300);
        } catch (error) {
          console.error('삭제 실패:', error);
          alert('삭제에 실패했습니다.');
        }
      }
    } else if (action === 'edit') {
      openEditModal(id, title, text);
    }
    
  } catch (error) {
    console.error('인증 실패:', error);
    let errorMessage = "인증 실패: ";
    switch(error.code) {
      case 'auth/wrong-password':
        errorMessage += "비밀번호가 틀렸습니다.";
        break;
      case 'auth/too-many-requests':
        errorMessage += "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
        break;
      case 'auth/network-request-failed':
        errorMessage += "네트워크 연결을 확인해주세요.";
        break;
      default:
        errorMessage += "관리자 권한이 필요합니다.";
    }
    alert(errorMessage);
  }
};

window.closeAdminAuthModal = () => {
  const modal = document.querySelector('.admin-auth-modal');
  if (modal) {
    modal.remove();
  }
  document.removeEventListener('keydown', handleAuthEscapeKey);
};

window.goToAdminPage = () => {
  closeAdminAuthModal();
  window.location.href = 'admin.html';
};

function handleAuthEscapeKey(e) {
  if (e.key === 'Escape') {
    closeAdminAuthModal();
  }
}

function openEditModal(id, title, text) {
  editingId = id;
  
  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>일기 수정</h3>
      <input type="text" id="editTitle" value="${title}" placeholder="제목">
      <textarea id="editText" placeholder="내용">${text}</textarea>
      <div class="modal-buttons">
        <button onclick="saveEdit()">저장</button>
        <button onclick="closeEditModal()">취소</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeEditModal();
    }
  });
  
  document.addEventListener('keydown', handleEscapeKey);
}

window.saveEdit = async () => {
  const title = document.getElementById('editTitle').value.trim();
  const text = document.getElementById('editText').value.trim();
  
  if (!title || !text) {
    alert('제목과 내용을 입력하세요');
    return;
  }
  
  try {
    await updateDoc(doc(db, 'diary', editingId), {
      title: title,
      text: text
    });
    
    closeEditModal();
    loadDiary();
  } catch (error) {
    console.error('수정 실패:', error);
    alert('수정에 실패했습니다.');
  }
};

window.closeEditModal = () => {
  const modal = document.querySelector('.edit-modal');
  if (modal) {
    modal.remove();
  }
  editingId = null;
  document.removeEventListener('keydown', handleEscapeKey);
};

function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeEditModal();
  }
}

function observeDiaryEntries() {
  const entries = document.querySelectorAll('.diary-entry');
  
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
  
  entries.forEach(entry => {
    observer.observe(entry);
  });
}

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;
document.head.appendChild(style);