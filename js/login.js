import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { auth } from "../firebase/firebase.js";

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = "admin@kiheon.com";
  const password = document.getElementById('password').value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "admin.html";
  } catch (err) {
    alert("로그인 실패: 비밀번호를 다시 확인해주세요.");
  }
});
