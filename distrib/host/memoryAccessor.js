var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        writeCount = 0;
        maxWriteCount = 0xFF;
        constructor() { }
        init() { }
        //Read a byte from a specific address in memory.
        read(address) {
            this.highlightMemoryCell(address);
            let value = _Memory[address];
            this.unhighlightMemoryCell(address);
            return value;
        }
        // Write a byte to a specific address in memory.
        write(address, value) {
            this.highlightMemoryCell(address);
            _Memory[address] = value;
            TSOS.Control.updateMemory(address, value);
            this.unhighlightMemoryCell(address);
        }
        highlightMemoryCell(address) {
            //console.log("Highlighting address: ", address); // Debugging line
            const column = (address % 8) + 2;
            const row = Math.floor(address / 8) + 1;
            const cellSelector = `#memoryTable > tr:nth-child(${row}) > td:nth-child(${column})`;
            const cell = document.querySelector(cellSelector);
            if (cell) {
                cell.classList.add('highlighted');
                cell.classList.remove('normal');
            }
        }
        unhighlightMemoryCell(address) {
            setTimeout(() => {
                const column = (address % 8) + 2;
                const row = Math.floor(address / 8) + 1;
                const cellSelector = `#memoryTable > tr:nth-child(${row}) > td:nth-child(${column})`;
                const cell = document.querySelector(cellSelector);
                if (cell) {
                    cell.classList.add('normal');
                    cell.classList.remove('highlighted');
                }
            }, 500); // Delay unhighlighting for 500 milliseconds
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map