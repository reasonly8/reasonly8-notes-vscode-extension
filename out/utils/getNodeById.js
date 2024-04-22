"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeById = void 0;
function getNodeById(notesTree, id) {
    let target = null;
    const loop = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
            if (target) {
                break;
            }
            if (nodes[i].id === id) {
                target = nodes[i];
            }
            nodes[i].children && loop(nodes[i].children);
        }
    };
    loop(notesTree);
    return target;
}
exports.getNodeById = getNodeById;
//# sourceMappingURL=getNodeById.js.map