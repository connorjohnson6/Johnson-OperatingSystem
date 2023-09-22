var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memory;
        // The memory accessor needs a reference to the main memory to function.
        // We pass this reference through the constructor.
        constructor(memory) {
            this.memory = memory;
        }
        // Read a byte from a specific address in memory using the memory's read method.
        read(address) {
            return this.memory.read(address);
        }
        // Write a byte to a specific address in memory using the memory's write method.
        write(address, value) {
            this.memory.write(address, value);
        }
        // Reads a byte from a specific address in memory.
        readFromAddress(address) {
            return this.read(address);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map