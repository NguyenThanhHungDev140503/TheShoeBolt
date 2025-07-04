"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesAll = exports.RolesAny = exports.Roles = exports.ROLES_ALL_KEY = exports.ROLES_ANY_KEY = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
exports.ROLES_ANY_KEY = 'roles_any';
exports.ROLES_ALL_KEY = 'roles_all';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const RolesAny = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_ANY_KEY, roles);
exports.RolesAny = RolesAny;
const RolesAll = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_ALL_KEY, roles);
exports.RolesAll = RolesAll;
//# sourceMappingURL=roles.decorator.js.map