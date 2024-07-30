document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = new URL(window.location.href).pathname.split('/').pop(); // Extraer el token de la URL
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    try {
        const response = await fetch(`/api/sessions/reset/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = '/login';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al restablecer la contraseña.');
    }
});