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
                            
            // Assign a PID 
            let pid = _PIDCounter++;
                            
            let availablePartition = _MemoryManager.findAvailablePartition();
            console.log("Available Partition:", availablePartition); // Debugging log
            
            if (availablePartition) {

                console.log("OpCodes being loaded into memory:", opCodes);

                // Load the op codes into memory and assign them to a partition with the PID
                _MemoryManager.loadProcess(pid, opCodes);
                
                // Find the partition where the op codes were loaded
                let partition = _MemoryManager.findPartitionByPID(pid);
                console.log("Partition: ", partition); // Debugging log

                if (partition) {
                    console.log("Available partition found."); // Debugging log
                    
                                
                    // Initialize the PCB
                    let pcb = new TSOS.PCB(pid, partition.base, partition.limit); 
                    pcb.state = "Ready";
                    _PCBMap.set(pid, pcb);

                    console.log(`PCB details for PID ${pid}:`, JSON.stringify(pcb));

                    
                    // Immediately update the PCB display after a new PCB is created
                    console.log("Before updating PCBs"); // Debugging log
                    TSOS.Control.updatePCBs();
                    console.log("After updating PCBs"); // Debugging log

                                    
                    _StdOut.putText(`Op codes loaded into memory with PID: ${pid}.`);
                }else {
                    _StdOut.putText(`No partition found for PID: ${pid}`);
                }
            } else {
                // Handle the case where there is no more memory or PID limit is reached
                _StdOut.putText(`No more memory ... Must run a PID to load more input`);
            }
      
        }

        
        
    }

    
}