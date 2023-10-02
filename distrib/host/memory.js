var TSOS;
(function (TSOS) {
    class Memory {
        memory;
        constructor() {
            this.memory = new Array(256).fill(0);
        }
        init() {
            this.memory.fill(0);
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map