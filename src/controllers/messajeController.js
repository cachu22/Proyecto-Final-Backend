import { messageModel } from '../daos/MONGO/models/message.models.js';

// Función para guardar un mensaje
export async function saveMessage(user, message) {
    try {
        // Validar que los parámetros no estén vacíos
        if (!user || !message) {
            throw new Error('Usuario y mensaje son requeridos');
        }

        // Crear una nueva instancia de mensaje
        const newMessage = new messageModel({ user, message });
        
        // Guardar el mensaje en la base de datos
        await newMessage.save();
        console.log('Mensaje guardado con éxito');
    } catch (error) {
        // Manejar errores
        console.error('Error al guardar el mensaje:', error.message);
        throw error; // Propagar el error para que pueda ser manejado en el controlador que llama a esta función
    }
}