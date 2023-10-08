module TSOS {

    
    export class MemoryAccessor {

        private writeCount: number = 0;
        private maxWriteCount: number = 0xFF; 

        constructor() {}

        public init(){}

        //Read a byte from a specific address in memory.
        public read(address: number): number {
            return _Memory[address];
        }


        // Write a byte to a specific address in memory.
        public write(address: number, value: number): void {

            _Memory[address] = value;
    
            TSOS.Control.updateMemory(address, value);
            
            
        }
    }
}