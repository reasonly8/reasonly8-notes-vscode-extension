"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotesTree = void 0;
const fs = __importStar(require("fs"));
const genId_1 = require("./genId");
const nodePath = __importStar(require("path"));
function getNotesTree(path) {
    function getDir(path, fullPath) {
        const item = {
            id: (0, genId_1.genId)(),
            label: path,
            path: fullPath,
            type: 'unknown',
        };
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            item.type = 'directory';
        }
        else if (stats.isFile()) {
            item.type = 'file';
            item.originText = fs.readFileSync(fullPath, { encoding: 'utf-8' });
        }
        if (item.type !== 'directory') {
            return item;
        }
        const chidlPathList = fs.readdirSync(fullPath);
        item.children = chidlPathList.map(path => getDir(path, nodePath.join(fullPath, path)));
        return item;
    }
    const notesTree = getDir(path, path).children;
    if (Array.isArray(notesTree)) {
        // 返回前先过滤掉 .github 中的内容
        return notesTree
            .filter(note => note.label === '.github')
            .sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return 0;
        });
    }
    else {
        return [];
    }
}
exports.getNotesTree = getNotesTree;
//# sourceMappingURL=getNoteTree.js.map