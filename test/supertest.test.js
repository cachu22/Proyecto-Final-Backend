import { expect } from 'chai';
import request from 'supertest';

const requester = request('http://localhost:8000');

let token;

// //Test sobre usuarios
// describe('Test avanzado de sesión', () => {

//         it('Debe loguear correctamente a un usuario y devolver un token', async () => {
//             const mockUser = {
//                 email: 'adrianfer_87@hotmail.com',
//                 password: 'asd'
//             };

//             const result = await requester
//                 .post('/api/sessions/login')
//                 .send(mockUser);

//             // Asegúrate de que el token esté en el cuerpo de la respuesta
//             const { token: receivedToken } = result.body;

//             // Manejo de errores para verificar que se ha recibido un token
//             expect(result.statusCode).to.equal(200);
//             expect(receivedToken).to.be.a('string');
//             expect(receivedToken).to.not.be.empty;

//             // Guarda el token para las pruebas siguientes
//             token = receivedToken;
//         });

//         it('Debe obtener la sesión actual utilizando el token', async () => {
//             // Asegúrate de que el token esté en el encabezado de la solicitud
//             const response = await requester
//                 .get('/api/sessions/current')
//                 .set('Authorization', `Bearer ${token}`);

//             const { body, statusCode } = response;
//             console.log('Datos de la sesión:', body);

//             // Manejo de errores para verificar el estado de la respuesta y los datos del usuario
//             expect(statusCode).to.equal(200);
//             expect(body).to.have.property('status').that.equals('success');
//             expect(body.payload).to.have.property('email');
//             expect(body.payload).to.have.property('fullname');
//         });
//     });

    // describe('Test de ventas', () => {
    //     let token;

    //     before(async () => {
    //         // Realiza el login y guarda el token
    //         const loginResponse = await requester.post('/api/sessions/login').send({
    //             email: 'adrianfer_87@hotmail.com',
    //             password: 'asd'
    //         });
    //         console.log('login de supertest.test', loginResponse);
            

    //         const { token: receivedToken } = loginResponse.body;
    //         token = receivedToken;
    //     });

    //     it('El endpoint POST /api/mgProducts debe crear un producto correctamente', async () => {
    //         const productoMock = {
    //             title: 'Azucar',
    //             model: 'Morena',
    //             description: 'De buena calidad',
    //             price: 1000,
    //             thumbnails: 'https://picsum.photos/700/407?random',
    //             code: 21,
    //             stock: 10,
    //             category: 'Infusiones'
    //         };

    //         const response = await requester
    //             .post('/api/mgProducts')
    //             .set('Authorization', `Bearer ${token}`)
    //             .send(productoMock);

    //         const { statusCode, body } = response;

    //         console.log('Body en el post del supertest.test', body);

    //         expect(statusCode).to.equal(201);
    //         expect(body).to.have.property('status', 'success'); // Verifica si hay un status de éxito
    //         expect(body.payload).to.have.property('title', productoMock.title); // Verifica si dentro del payload está el título del producto
    //     });

    //     it('El endpoint GET /api/mgProducts debe devolver los productos correctamente', async () => {
    //         const response = await requester
    //             .get('/api/mgProducts')
    //             .set('Authorization', `Bearer ${token}`);
        
    //         const { statusCode, body } = response;
        
    //         console.log(body);
        
    //         expect(statusCode).to.equal(200);
    //         expect(body).to.be.an('object');
    //         expect(body).to.have.property('status').that.equals('success');
    //         expect(body).to.have.property('payload').that.is.an('array');
        
    //         // También puedes verificar si el array de productos no está vacío
    //         expect(body.payload.length).to.be.above(0);
    //     });

    //     it('El endpoint GET /api/mgProducts/:pid debe traer un producto por ID', async () => {
    //         const pid = '66afadd0596270c1e34df633';
        
    //         const response = await requester
    //             .get(`/api/mgProducts/${pid}`)
    //             .set('Authorization', `Bearer ${token}`);
        
    //         const { statusCode, body } = response;
        
    //         console.log('Producto por ID:', body);
        
    //         expect(statusCode).to.equal(200);
    //         expect(body).to.have.property('status', 'success');
    //         expect(body.payload).to.have.property('_id', pid);
    //     });
    // });


    describe('Registro de usuario e inicio de sesión con esas credenciales', () => {
        let token;
    
        it('Debe registrar un nuevo usuario y redirigir', async () => {
            const mockUser = {
                first_name: 'supertest',
                last_name: 'Fernández',
                email: 'adrianfer_87@hotmail.com',
                password: 'asd',
                age: 36,
                role: 'premium'
            };

            console.log('datos enviados desde el supertest0', mockUser);
            
    
            const response = await requester
                .post('/api/sessions/register')
                .send(mockUser);
    
            // Verifica que el código de estado sea 302 para redirección
            expect(response.statusCode).to.equal(302);
    
            // Aquí puedes manejar la redirección si es necesario
            // Por ejemplo, puedes seguir la redirección y verificar el resultado final
        });
    
    
        it('Debe loguear correctamente a un usuario y devolver un token', async () => {
            const mockUser = {
                email: 'adrianfer_87@hotmail.com',
                password: 'asd'
            };
    
            const result = await requester
                .post('/api/sessions/login')
                .send(mockUser);
    
            // Asegúrate de que el token esté en el cuerpo de la respuesta
            const { token: receivedToken } = result.body;
    
            // Manejo de errores para verificar que se ha recibido un token
            expect(result.statusCode).to.equal(200);
            expect(receivedToken).to.be.a('string');
            expect(receivedToken).to.not.be.empty;
    
            // Guarda el token para las pruebas siguientes
            token = receivedToken;
        });
    
        it('Debe obtener la sesión actual utilizando el token', async () => {
            // Asegúrate de que el token esté en el encabezado de la solicitud
            const response = await requester
                .get('/api/sessions/current')
                .set('Authorization', `Bearer ${token}`);
    
            const { body, statusCode } = response;
            console.log('Datos de la sesión:', body);
    
            // Manejo de errores para verificar el estado de la respuesta y los datos del usuario
            expect(statusCode).to.equal(200);
            expect(body).to.have.property('status').that.equals('success');
            expect(body.payload).to.have.property('email');
            expect(body.payload).to.have.property('fullname');
        });

    });