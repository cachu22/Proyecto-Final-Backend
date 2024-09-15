import { logger } from "../utils/logger.js";

export class UserDto {
    constructor(user) {
        this.email = user.email;
        this.fullname = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        this.role = user.role;
        this.id = `${user._id}`;

        logger.info('Fullname generado en DTO - Log de /src/dtos/users.dto.js:', this.fullname);
    }
}

export class UserInactiveDto {
    constructor(user) {
        this.email = user.email;
        this.fullname = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        this.last_connection = user.last_connection;

        logger.info('Datos de usuario inactivo generados en DTO - Log de /src/dtos/userInactive.dto.js:', this.fullname);
    }
}