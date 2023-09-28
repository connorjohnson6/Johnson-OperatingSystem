var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        // The memory accessor needs a reference to the main memory to function.
        // We pass this reference through the constructor.
        constructor() { }
        init() { }
        //Read a byte from a specific address in memory using the memory's read method.
        read(address) {
            return _Memory[address];
        }
        // Write a byte to a specific address in memory using the memory's write method.
        write(address, value) {
            _Memory[address] = value;
            TSOS.Memory.updateMemory(address, value);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map