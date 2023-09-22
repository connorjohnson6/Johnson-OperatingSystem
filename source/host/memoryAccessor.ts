module TSOS {
    export class MemoryAccessor {
        // The memory accessor needs a reference to the main memory to function.
        // We pass this reference through the constructor.
        constructor(private memory: Memory) {}

        // Read a byte from a specific address in memory using the memory's read method.
        public read(address: number): number {
            return this.memory.read(address);
        }

        // Write a byte to a specific address in memory using the memory's write method.
        public write(address: number, value: number): void {
            this.memory.write(address, value);
        }
        
        // Reads a byte from a specific address in memory.
        public readFromAddress(address: number): number {
            return this.read(address);
        }
    }
}
