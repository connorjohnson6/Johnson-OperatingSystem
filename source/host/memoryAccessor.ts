module TSOS {
    export class MemoryAccessor {
        // The memory accessor needs a reference to the main memory to function.
        // We pass this reference through the constructor.
        constructor() {}

        public init(){}

        //Read a byte from a specific address in memory using the memory's read method.
        public read(address: number): number {
            return _Memory[address];
        }

        // Write a byte to a specific address in memory using the memory's write method.
        public write(address: number, value: number): void {
            _Memory[address] = value;
            _MemoryAccessor.write(address, value);
    
            //TSOS.Control.updateMemory(address, value);
        }
        
    }
}
