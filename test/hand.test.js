import { expect } from 'chai'
import UserDto from '../src/dtos/users.dto.js'
import { createHash, isValidPassword } from '../src/utils/bcrypt.js'

describe ('Testing Bcrypt utilidad', () => {
    it('El servicio debe devolver un hasheo efectivo del password', async () => {
        const password = '123456'
        const hashPassword = await createHash(password)
        console.log(hashPassword);
        expect(hashPassword).to.not.equal(password)
    })

    it('El hasheo realizado debe poder compararse de manera efectiva con el password original', async () => {
        const password = '123456'
        const hashPassword = await createHash(password)

        const passwordValidation = await isValidPassword({password: hashPassword}, password)
        // expect(passwordValidation).to.be.ok
        expect(passwordValidation).to.be.true
    })

    it('El hasheo realizado al ser alterado debe fallar el test', async () => {
        const password = '123456'
        const hashPassword = await createHash(password)
        const hashAlterado = hashPassword+'qwf'

        const passwordValidation = await isValidPassword({password: hashAlterado}, password)
        // expect(passwordValidation).to.be.ok
        expect(passwordValidation).to.be.false
    })
})

describe('Testing del UserDTO', () => {
    before(function () {
        // El DTO debe ser inicializado aquí con un usuario de prueba
        const userMock = {
            first_name: 'Adrian',
            last_name: 'Fernandez',
            email: 'adrianfer_87@hotmail.com',
            password: 'test'
        };

        this.userDto = new UserDto(userMock);
    });

    it('El DTO debe unificar el first_name y el last_name en una única propiedad llamada fullname', function () {
        // Log para verificar el fullname
        console.log('Valor de fullname en el test:', this.userDto.fullname);

        expect(this.userDto).to.have.property('fullname', 'Adrian Fernandez');
    });

    it('Verificar campos', function () {

        expect(this.userDto).to.not.have.property('first_name');
        expect(this.userDto).to.not.have.property('last_name');
        expect(this.userDto).to.not.have.property('password');
    });
});