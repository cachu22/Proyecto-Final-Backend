document.addEventListener('DOMContentLoaded', async () => {
    // Simulación de datos de usuario actual (esto debería ser obtenido desde tu backend)
    const currentUser = {
        id: 'admin_id',
        email: 'admin@example.com',
        role: 'admin'
    };
    
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
                <span>Usuario: ${user.email} - Rol de usuario: ${user.role}</span>
                ${currentUser.role === 'admin' ? `
                    <button onclick="changeUserRole('${user.id}')">Cambiar Rol</button>
                    <button onclick="deleteUser('${user.id}')">Eliminar Usuario</button>
                ` : ''}
            `;
            userList.appendChild(userDiv);
        });
    } catch (error) {
        console.error(error);
        alert('Error al cargar los usuarios');
    }
});

async function changeUserRole(userId) {
    const token = localStorage.getItem('token'); // O donde sea que estés guardando el token

    try {
        const response = await fetch(`/api/usersDB/premium/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`, // Agrega el token en el encabezado
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            location.reload(); 
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        alert('Error al cambiar el rol del usuario.');
        console.error(error);
    }
}

async function deleteUser(userId) {
    const token = localStorage.getItem('token'); // O donde sea que estés guardando el token

    try {
        const response = await fetch(`/api/usersDB/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`, // Agrega el token en el encabezado
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            location.reload(); 
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        alert('Error al eliminar el usuario.');
        console.error(error);
    }
}