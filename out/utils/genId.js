"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genId = void 0;
const crypto_1 = require("crypto");
function genId() {
    function generateUUID() {
        const uuid = [];
        for (let i = 0; i < 4; i++) {
            uuid.push((0, crypto_1.randomBytes)(4).toString('hex'));
        }
        return uuid.join('-');
    }
    const uuid = generateUUID();
    return uuid;
}
exports.genId = genId;
//# sourceMappingURL=genId.js.map