var TSOS;
(function (TSOS) {
    class Memory {
        // Initialize an array of 256 elements to represent the 256 bytes of memory.
        // We fill it with zeros to start with a clean slate.
        memory = new Array(256).fill(0);
        // Read a byte from a specific address in memory.
        read(address) {
            return this.memory[address];
        }
        // Write a byte to a specific address in memory.
        write(address, value) {
            this.memory[address] = value;
        }
        // Clear the memory by resetting all bytes to zero.
        clear() {
            this.memory.fill(0);
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map