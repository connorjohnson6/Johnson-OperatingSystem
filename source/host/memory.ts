module TSOS {
    export class Memory {
        private memory: number[];

        constructor() {
            this.memory = new Array(256).fill(0);
        }

        public init() {
            this.memory.fill(0);
        }




        public static loadIntoMemory(taProgramInput): void {
 
                
                // Split the input by spaces to get individual op codes
                let opCodes = taProgramInput.split(/\s+/);
                        
                // Load the op codes into memory
                for (let i = 0; i < opCodes.length; i++) {
                    _MemoryAccessor.write(i, parseInt(opCodes[i], 16));
                }
                
                // Assign a PID 
                let pid = _PIDCounter++;
                        
                if(pid < 3){
                    // Initialize the PCB
                    let pcb = new TSOS.PCB(pid); 
                    pcb.state = "Ready";
                    _PCBMap.set(pid, pcb);
        
                    // Initialize other PCB properties if necessary
                    TSOS.Control.updatePCBs()
        
                    _StdOut.putText(`Op codes loaded into memory with PID: ${pid}.`);
                } else {
                    // Handle the case where there is no more memory or PID limit is reached
                    _StdOut.putText(`No more memory ... Must run a PID to load more input`);
                }        
        }
        
    }



    


    
}
