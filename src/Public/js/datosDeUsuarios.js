document.addEventListener('DOMContentLoaded', async () => {
    // Supón que tienes el token guardado en algún lugar, como en localStorage
    const token = localStorage.getItem('token'); // O donde sea que estés guardando el token
    
    try {
        const response = await fetch('http://localhost:8000/api/usersDB', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Agrega el token en el encabezado
                'Content-Type': 'application/json'
            }
        });
    
        if (!response.ok) {
            throw new Error('Error al obtener los usuarios');
        }
    
        const data = await response.json();
        const users = data.payload;
    
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';
    
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.innerHTML = `
                <span>${user.fullname} - ${user.email} - ${user.role} - </span>
            `;
            userList.appendChild(userDiv);
        });
    } catch (error) {
        console.error(error);
        alert('Error al cargar los usuarios');
    }
});