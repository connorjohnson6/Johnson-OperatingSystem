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
        //credit from looking at the hall of fame KeeDOS
        static updateMemory(address, value) {
            const column = (address % 8) + 2;
            const row = Math.floor(address / 8) + 1;
            const cellSelector = `#memoryTable > tr:nth-child(${row}) > td:nth-child(${column})`;
            const cell = document.querySelector(cellSelector);
            if (cell) {
                cell.innerText = TSOS.Utils.toHexString(value, 2);
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map