document.addEventListener('DOMContentLoaded', () => {
    // Fonction principale pour définir le thème
    const setTheme = (theme) => {
        // Validation du thème
        theme = theme === 'dark' ? 'dark' : 'light';
        
        // Mettre à jour les attributs
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        // Sauvegarder le thème
        localStorage.setItem('sarafina-theme', theme);
        
        // Mettre à jour les classes du body
        if (theme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        }
        
        // Mettre à jour les icônes de tous les boutons de thème sur la page
        const sunIcons = document.querySelectorAll('.theme-toggle .sun-icon');
        const moonIcons = document.querySelectorAll('.theme-toggle .moon-icon');
        
        sunIcons.forEach(icon => {
            icon.style.opacity = theme === 'light' ? '1' : '0.5';
        });
        
        moonIcons.forEach(icon => {
            icon.style.opacity = theme === 'dark' ? '1' : '0.5';
        });
    };
    
    // Fonction de basculement de thème
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };
    
    // Récupérer le thème précédent
    const savedTheme = localStorage.getItem('sarafina-theme') || 'light';
    setTheme(savedTheme);
    
    // Ajouter des écouteurs de thème
    const addThemeListeners = () => {
        const themeToggles = document.querySelectorAll('.theme-toggle');
        
        themeToggles.forEach(themeToggle => {
            // Supprimer les anciens écouteurs pour éviter les doublons
            themeToggle.removeEventListener('click', toggleTheme);
            themeToggle.removeEventListener('touchstart', toggleTheme);
            
            // Ajouter de nouveaux écouteurs
            themeToggle.addEventListener('click', toggleTheme);
            themeToggle.addEventListener('touchstart', toggleTheme);
        });
    };
    
    // Ajouter les écouteurs initiaux
    addThemeListeners();
    
    // Observer les changements dynamiques pour ajouter des écouteurs
    const observer = new MutationObserver(() => {
        addThemeListeners();
    });
    
    // Commencer l'observation
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});