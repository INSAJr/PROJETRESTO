import { showError } from '../components/uiModule.js';
import { loginCashier, redirectToDashboard } from './authModule.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('cashier-login-btn');
  const loginInput = document.getElementById('cashier-login');
  const passwordInput = document.getElementById('cashier-password');


  loginBtn.addEventListener('click', async () => {
    const username = loginInput.value.trim();
      const password = passwordInput.value.trim();

    if (!username) {
         showError('Veuillez entrer votre identifiant',loginInput);
         return;
      }
    if (!password) {
          showError('Veuillez entrer votre mot de passe',passwordInput);
          return;
    }
    
     const result = await loginCashier(username, password);
      if (result) {
          redirectToDashboard()
     }

  });

  // Permettre la connexion avec la touche Entrée
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });
});