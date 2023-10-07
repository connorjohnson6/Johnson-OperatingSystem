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
        
            //looking for potention infite loops due to it exceeding memory limit
            if (_CPU.Yreg > 0XFF) {
                // Terminate process or take other appropriate action
                _CPU.isExecuting = false;
                _CPU.init();  // re-initialize or clear CPU state

                if (_CPU.currentPCB) {
                    _CPU.currentPCB.state = "Terminated";
                    TSOS.Control.updatePCBs();
                    _StdOut.putText(`Process ${_CPU.currentPCB.pid} has been manually terminated`);
                
                    
                }

                Kernel.krnTrapError("Potential infinite loop detected: too many write operations");

            }
            
            
        }
    }
}
