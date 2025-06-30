import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { auth } from "../firebase/firebase.js";

console.log('login.js 로드됨');
console.log('auth 객체:', auth);

const loginForm = document.getElementById('loginForm');

if (!loginForm) {
  console.error('loginForm 요소를 찾을 수 없습니다!');
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('로그인 폼 제출됨');
  
  const email = "admin@kiheon.com";
  const password = document.getElementById('password').value.trim();
  
  console.log('이메일:', email);
  console.log('비밀번호 길이:', password.length);
  
  if (!password) {
    alert('비밀번호를 입력해주세요.');
    return;
  }

  try {
    console.log('로그인 시도 중...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('로그인 성공:', userCredential.user);
    console.log('사용자 이메일:', userCredential.user.email);
    
    alert('로그인 성공! admin 페이지로 이동합니다.');
    window.location.href = "admin.html";
  } catch (err) {
    console.error('로그인 에러:', err);
    console.error('에러 코드:', err.code);
    console.error('에러 메시지:', err.message);
    
    let errorMessage = "로그인 실패: ";
    switch(err.code) {
      case 'auth/user-not-found':
        errorMessage += "사용자를 찾을 수 없습니다.";
        break;
      case 'auth/wrong-password':
        errorMessage += "비밀번호가 틀렸습니다.";
        break;
      case 'auth/invalid-email':
        errorMessage += "잘못된 이메일 형식입니다.";
        break;
      case 'auth/network-request-failed':
        errorMessage += "네트워크 연결을 확인해주세요.";
        break;
      default:
        errorMessage += err.message;
    }
    
    alert(errorMessage);
  }
});