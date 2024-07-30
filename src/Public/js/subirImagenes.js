const handleImageUpload = () => {
    const inputFile = document.getElementById('myfile');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const deleteImageButton = document.getElementById('deleteImageButton');

    inputFile.addEventListener('change', function(event) {
        const file = event.target.files[0];
        console.log('Archivo seleccionado - log de /src/Public/js/subirImagenes.js:', file);

        // Validar que se haya seleccionado un archivo y sea una imagen
        if (file && file.type.startsWith('image/')) {
            // Mostrar la vista previa de la imagen en miniatura
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = 'block'; // Mostrar el contenedor de vista previa
                console.log('Vista previa de la imagen mostrada - log de /src/Public/js/subirImagenes.js.');

                // Enviar la imagen al servidor
                uploadImage(file);
            }
            reader.readAsDataURL(file);
        } else {
            // Limpiar la vista previa si no se seleccionó una imagen válida
            imagePreview.src = '';
            imagePreviewContainer.style.display = 'none'; // Ocultar el contenedor de vista previa
            console.log('Archivo no válido seleccionado - log de /src/Public/js/subirImagenes.js.');
        }
    });

    // Manejar la eliminación de la imagen
    deleteImageButton.addEventListener('click', function() {
        // Limpiar la entrada de archivo y ocultar la vista previa
        inputFile.value = '';
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
        console.log('Imagen eliminada - log de /src/Public/js/subirImagenes.js.');
    });
};

// Función para enviar la imagen al servidor
const uploadImage = (file) => {
    const formData = new FormData();
    formData.append('myfile', file);

    fetch('/upload-file', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            console.log('¡Imagen subida con éxito! - log de /src/Public/js/subirImagenes.js');
            // Puedes realizar acciones adicionales aquí después de que la imagen se haya subido exitosamente
        } else {
            console.error('Error al subir la imagen - log de /src/Public/js/subirImagenes.js:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error al subir la imagen - log de /src/Public/js/subirImagenes.js:', error);
    });
};

// Llamar a la función para manejar la carga de la imagen
handleImageUpload();