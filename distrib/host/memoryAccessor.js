var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() { }
        init() { }
        //Read a byte from a specific address in memory.
        read(address) {
            return _Memory[address];
        }
        // Write a byte to a specific address in memory.
        write(address, value) {
            _Memory[address] = value;
            TSOS.Memory.updateMemory(address, value);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map