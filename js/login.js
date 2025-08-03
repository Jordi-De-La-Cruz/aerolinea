// js/login.js - Para funcionalidades específicas del login
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');

    // Toggle de contraseña
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function () {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;

            const icon = passwordToggle.querySelector('i');
            icon.className = type === 'password' ? 'ti ti-eye' : 'ti ti-eye-off';
        });
    }

    // Validación del formulario
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Tu lógica de validación aquí
        });
    }
});