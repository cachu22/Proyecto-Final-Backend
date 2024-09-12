import { expect } from 'chai';
import request from 'supertest';
import { userService } from '../src/service/index.js'
import { app } from '../src/server.js';
import FormData from 'form-data';
import { Should } from 'chai';
import path from 'path';
import { __dirname } from '../src/utils/utils.js';

request(app)

let token;

                    // TEST SOBRE USUARIOS y SESSIONS
// //Test sobre usuarios
// describe('Test avanzado de sesión', () => {

//         it('Debe loguear correctamente a un usuario y devolver un token', async () => {
//             const mockUser = {
//                 email: 'test1@asd.com',
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

//     describe('Test de ventas', () => {
//         let token;

//         before(async () => {
//             // Realiza el login y guarda el token
//             const loginResponse = await requester.post('/api/sessions/login').send({
//                 email: 'test1@asd.com',
//                 password: 'asd'
//             });
//             console.log('login de supertest.test', loginResponse);
            

//             const { token: receivedToken } = loginResponse.body;
//             token = receivedToken;
//         });

//         it('El endpoint POST /api/mgProducts debe crear un producto correctamente', async () => {
//             const productoMock = {
//                 title: 'Azucar',
//                 model: 'Morena',
//                 description: 'De buena calidad',
//                 price: 1000,
//                 thumbnails: 'https://picsum.photos/700/407?random',
//                 code: 21,
//                 stock: 10,
//                 category: 'Infusiones'
//             };

//             const response = await requester
//                 .post('/api/mgProducts')
//                 .set('Authorization', `Bearer ${token}`)
//                 .send(productoMock);

//             const { statusCode, body } = response;

//             console.log('Body en el post del supertest.test', body);

//             expect(statusCode).to.equal(201);
//             expect(body).to.have.property('status', 'success'); // Verifica si hay un status de éxito
//             expect(body.payload).to.have.property('title', productoMock.title); // Verifica si dentro del payload está el título del producto
//         });

//         it('El endpoint GET /api/mgProducts debe devolver los productos correctamente', async () => {
//             const response = await requester
//                 .get('/api/mgProducts')
//                 .set('Authorization', `Bearer ${token}`);
        
//             const { statusCode, body } = response;
        
//             console.log(body);
        
//             expect(statusCode).to.equal(200);
//             expect(body).to.be.an('object');
//             expect(body).to.have.property('status').that.equals('success');
//             expect(body).to.have.property('payload').that.is.an('array');
        
//             // También puedes verificar si el array de productos no está vacío
//             expect(body.payload.length).to.be.above(0);
//         });

//         it('El endpoint GET /api/mgProducts/:pid debe traer un producto por ID', async () => {
//             const pid = '66afadd0596270c1e34df633';
        
//             const response = await requester
//                 .get(`/api/mgProducts/${pid}`)
//                 .set('Authorization', `Bearer ${token}`);
        
//             const { statusCode, body } = response;
        
//             console.log('Producto por ID:', body);
        
//             expect(statusCode).to.equal(200);
//             expect(body).to.have.property('status', 'success');
//             expect(body.payload).to.have.property('_id', pid);
//         });
//     });


//     describe('Registro de usuario e inicio de sesión con esas credenciales', () => {
//         let token;
    
//         it('Debe registrar un nuevo usuario y redirigir', async () => {
//             const mockUser = {
//                 first_name: 'supertest',
//                 last_name: 'Fernández',
//                 email: 'test2@test.com',
//                 password: 'asd',
//                 age: 36,
//                 role: 'premium'
//             };

//             console.log('datos enviados desde el supertest0', mockUser);
            
    
//             const response = await requester
//                 .post('/api/sessions/register')
//                 .send(mockUser);
    
//             // Verifica que el código de estado sea 302 para redirección
//             // expect(response.statusCode).to.equal(302);
    
//             // Aquí puedes manejar la redirección si es necesario
//             // Por ejemplo, puedes seguir la redirección y verificar el resultado final
//         });
    
    
//         it('Debe loguear correctamente a un usuario y devolver un token', async () => {
//             const mockUser = {
//                 email: 'test2@test.com',
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

    // //Test sobre usuarios
// describe('Test para cambio de rol', () => {
//     let adminToken;

//     before(async () => {
//         // Autenticar como administrador y obtener el token
//         const adminCredentials = {
//             email: 'asd@asd.com',
//             password: 'asd'
//         };

//         const loginResponse = await requester
//             .post('/api/sessions/login')
//             .send(adminCredentials);

//         // Verifica que el login fue exitoso y guarda el token
//         expect(loginResponse.statusCode).to.equal(200);
//         adminToken = loginResponse.body.token;
//         expect(adminToken).to.be.a('string');
//         expect(adminToken).to.not.be.empty;
//     });

//     it('Debe cambiar el rol al usuario test3@test.com', async () => {
//         const userId = '66bdb1d8b74a4da6a4a47d12';

//         // Cambiar el rol del usuario
//         const changeRoleResponse = await requester
//             .put(`/api/usersDB/premium/${userId}`)
//             .set('Authorization', `Bearer ${adminToken}`);

//         // Verificar que la operación fue exitosa
//         expect(changeRoleResponse.statusCode).to.equal(200);
//         expect(changeRoleResponse.body.status).to.equal('success');
//         expect(changeRoleResponse.body.user.role).to.equal('premium');

//         // Puedes hacer una verificación adicional para asegurarte de que el rol ha cambiado
//         const updatedUserResponse = await requester
//             .get(`/api/usersDB/${userId}`)
//             .set('Authorization', `Bearer ${adminToken}`);

//         expect(updatedUserResponse.body.payload.role).to.equal('premium');
//     });
// });     


                            // describe('Test avanzado de sesión y cambio de rol', function() {
                            //     let userToken;
                            //     let adminToken;
                            //     let userId;

                            //     before(async function() {
                            //         // Registra un nuevo usuario
                            //         const userResponse = await request(app)
                            //             .post('/api/sessions/register')
                            //             .send({
                            //                 first_name: 'test',
                            //                 last_name: 'deRol',
                            //                 email: 'testRol@test.com',
                            //                 password: 'asd',
                            //                 age: 36,
                            //                 role: 'user'
                            //             });
                            //         userToken = userResponse.body.token;
                            //         userId = userResponse.body.userId;

                            //         // Inicia sesión para obtener el token de admin
                            //         const adminResponse = await request(app)
                            //             .post('/api/sessions/login')
                            //             .send({
                            //                 email: 'asd@asd.com',
                            //                 password: 'asd'
                            //             });
                            //         adminToken = adminResponse.body.token;
                            //     });

                            //     it('Debería permitir al admin cambiar el rol del usuario de "user" a "premium"', function(done) {
                            //         request(app)
                            //             .put(`/api/usersDB/premium/${userId}`)
                            //             .set('Authorization', `Bearer ${adminToken}`)
                            //             .attach('documents', 'path/to/identificacion.pdf')
                            //             // .expect(200)
                            //             .end((err, res) => {
                            //                 if (err) return done(err);

                            //                 request(app)
                            //                     .put(`/api/usersDB/premium/${userId}`)
                            //                     .set('Authorization', `Bearer ${adminToken}`)
                            //                     .send({ role: 'premium' })
                            //                     // .expect(200)
                            //                     .end((err, res) => {
                            //                         if (err) return done(err);
                            //                         expect(res.text).to.include('Rol cambiado exitosamente');
                            //                         done();
                            //                     });
                            //             });
                            //     });
                            // });

//Para test


//Test para generacion de usuario "user" y login de admin para cambio de rol del usuario generado
// describe('Test avanzado de sesión y cambio de rol', function() {
//     let userToken;
//     let adminToken;
//     let userId;

//     before(async function() {
//         // Registra un nuevo usuario
//         const userResponse = await request(app)
//             .post('/api/sessions/register')
//             .send({
//                 first_name: 'test',
//                 last_name: 'deRol',
//                 email: 'testRol@test.com',
//                 password: 'asd',
//                 age: 36,
//                 role: 'user'
//             });
//         userToken = userResponse.body.token;
//         userId = userResponse.body.userId;

//         // Inicia sesión para obtener el token de admin
//         const adminResponse = await request(app)
//             .post('/api/sessions/login')
//             .send({
//                 email: 'asd@asd.com',
//                 password: 'asd'
//             });
//         adminToken = adminResponse.body.token;
//     });

//     it('Debería permitir al admin cambiar el rol del usuario de "user" a "premium"', function(done) {
//         request(app)
//             .put(`/api/usersDB/premium/${userId}`)
//             .set('Authorization', `Bearer ${adminToken}`)
//             .send({ role: 'premium' }) // No se envían archivos
//             .expect(200)
//             .end((err, res) => {
//                 if (err) return done(err);
//                 // Verifica que el rol se haya cambiado exitosamente
//                 expect(res.body.message).to.include('Rol de usuario actualizado');
//                 done();
//             });
//     });
// });

describe('Test avanzado de sesión y cambio de rol', function() {
    let userToken;
    let adminToken;
    let userId;

    before(async function() {
        // Registra un nuevo usuario
        const userResponse = await request(app)
            .post('/api/sessions/register')
            .send({
                first_name: 'test',
                last_name: 'deRol',
                email: 'testRol@test.com',
                password: 'asd',
                age: 36,
                role: 'user'
            });
        userToken = userResponse.body.token;
        userId = userResponse.body.userId;

        // Inicia sesión para obtener el token de admin
        const adminResponse = await request(app)
            .post('/api/sessions/login')
            .send({
                email: 'asd@asd.com',
                password: 'asd'
            });
        adminToken = adminResponse.body.token;
    });

    it('Debería permitir al admin cambiar el rol del usuario de "user" a "premium" si se suben los documentos correctos', function(done) {
        request(app)
            .put(`/api/usersDB/premium/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('document', path.resolve(__dirname, '../test/path/to/identificacion.pdf')) // Simular subida de archivo de identificación
            .attach('document', path.resolve(__dirname, '../test/path/to/comprobante_domicilio.pdf')) // Simular subida de comprobante de domicilio
            .attach('document', path.resolve(__dirname, '../test/path/to/comprobante_estado_cuenta.pdf'))
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(res.body); // Ver el mensaje de error
                    return done(err);
                }
                expect(res.body.message).to.include('Rol de usuario actualizado');
                done();
            });
    });
});