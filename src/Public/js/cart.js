document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:8000';
    const cartIdElement = document.getElementById('cartId');
    const cartId = cartIdElement ? cartIdElement.textContent.trim() : null;
    console.log(`ID del carrito: ${cartId}`);

    document.getElementById('purchaseButton').addEventListener('click', function() {
        const token = localStorage.getItem('token');
        
        fetch(`${apiUrl}/api/cartsDB/${cartId}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Manejar la respuesta
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});