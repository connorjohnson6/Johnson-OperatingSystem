module TSOS {
    export class Memory {
        // Initialize an array of 256 elements to represent the 256 bytes of memory.
        // We fill it with zeros to start with a clean slate.
        private memory: number[] = new Array(256).fill(0);

        // Read a byte from a specific address in memory.
        public read(address: number): number {
            return this.memory[address];
        }

        // Write a byte to a specific address in memory.
        public write(address: number, value: number): void {
            this.memory[address] = value;
        }

        // Clear the memory by resetting all bytes to zero.
        public clear(): void {
            this.memory.fill(0);
        }
    }
}