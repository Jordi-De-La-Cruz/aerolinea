// Tu app.js actual (tema toggle)
const switchButton = document.getElementById('switch') || document.getElementById('themeToggle');

if (switchButton) {
    switchButton.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        document.body.classList.toggle('dark-theme'); // Para compatibilidad
        switchButton.classList.toggle('active');

        // Guardar preferencia
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('darkTheme', isDark);
    });

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        document.body.classList.add('dark');
        document.body.classList.add('dark-theme');
        switchButton.classList.add('active');
    }
}