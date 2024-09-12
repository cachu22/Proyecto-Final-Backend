document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:8000'; // URL base de tu API
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
            if (data.message === 'Compra realizada con éxito') {
                Swal.fire({
                    icon: 'success',
                    title: 'Compra realizada con éxito',
                    html: `
                        <p><strong>Código del ticket:</strong> ${data.ticket.code}</p>
                        <p><strong>Importe:</strong> ${data.ticket.amount} $</p>
                        <p><strong>Fecha de compra:</strong> ${new Date(data.ticket.purchase_datetime).toLocaleString()}</p>
                        <p><strong>Comprador:</strong> ${data.ticket.purchaser}</p>
                    `,
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Redirigir al usuario a la página principal o alguna otra página
                    window.location.href = '/';
                });
            } else {
                Swal.fire('Error', 'No se pudo completar la compra', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo completar la compra', 'error');
        });
    });
});