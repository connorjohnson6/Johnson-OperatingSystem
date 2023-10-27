module TSOS {
    export class MemoryManager {
        private static readonly BLOCK_SIZE = 0xFF; // 256
        
        private partitions: { base: number, limit: number, occupied: boolean, pcb?: PCB }[] = [
            { base: 0x000, limit: 0x0FF, occupied: false },
            { base: 0x100, limit: 0x1FF, occupied: false },
            { base: 0x200, limit: 0x2FF, occupied: false }
        ];
        
        constructor() {}
        
        public loadProcess(pcb: PCB, opCodes: string[]): boolean {
            console.log("Received PCB at start:", JSON.stringify(pcb)); // Log the received PCB object
            
            const partition = this.findAvailablePartition();
            if (!partition || opCodes.length > MemoryManager.BLOCK_SIZE) {
                // Handle error: No available memory or Input exceeds block size
                console.error("No available partition found or Input exceeds block size for process:", pcb.pid);
                return false;
            }
        
            // Update the PCB details based on the partition
            pcb.base = partition.base;
            pcb.limit = partition.limit;
            
            partition.occupied = true;
            partition.pcb = pcb; // Directly assign the received PCB object
        
            // Ensure that the PCB is added to the _PCBMap or updated in it
            _PCBMap.set(pcb.pid, pcb); // Assuming _PCBMap is a Map

                // Add the PCB to the scheduler's residentList
            _Scheduler.residentList.set(pcb.pid, pcb);
            
            console.log("Assigned PCB to partition:", partition); // Log after assigning PCB
            
            // Call the update function to refresh the DOM
            TSOS.Control.updatePCBs();
        
            console.log("Partition after assignment:", partition);
            console.log("PCB after assignment:", pcb);
        
            // Load the op codes into memory
            for (let i = 0; i < opCodes.length; i++) {
                const opcode = parseInt(opCodes[i], 16);
                _MemoryAccessor.write(i, opcode, partition.base);
            }
            
            console.log("Partition after loading process:", partition); // Debugging line to check the partition
            
            return true; // Successfully loaded the process
        }
        
        
        
        
        
        public unloadProcess(pcb : PCB) {
            const partition = this.findPartitionByPID(pcb.pid);
            if (partition) {
                this.clearMemory(partition.base, partition.limit);
                partition.occupied = false;
                partition.pcb = undefined;
            }
        }

        public clearMemory(base: number, limit: number): void {
            for (let i = base; i <= limit; i++) {
                _MemoryAccessor.write(i - base, 0, base);
            }
        }

        public findPartitionByPID(pid: number) {
            console.log("Searching for partition with PID:", pid);
            console.log("Current state of partitions:", JSON.stringify(this.partitions));
            
            // Search for the partition where the pcb.pid property matches the pid
            const foundPartition = this.partitions.find(p => p.pcb?.pid === pid);
            
            if (foundPartition) {
                console.log("Found partition:", foundPartition);
            } else {
                console.log("No partition found for PID:", pid);
            }
            
            return foundPartition;
        }
        
        
        public clearAll(): void {
            this.partitions.forEach(partition => {
                if (partition.occupied) {
                    this.clearMemory(partition.base, partition.limit);
                    partition.occupied = false;
                    partition.pcb = undefined;
                }
            });
        }

        public markPartitionAsAvailable(base: number, limit: number): void {
            let partition = this.findPartition(base, limit);
            if (partition) {
                partition.occupied = false;
            }
        }
        
        public findPartition(base: number, limit: number) {
            // Assuming you have a list or array of partitions
            for (let partition of this.partitions) {
                if (partition.base === base && partition.limit === limit) {
                    return partition;
                }
            }
            return null;
        }
        
        
        

        public findAvailablePartition(): any {
            // Return the first unoccupied partition found
            return this.partitions.find(p => !p.occupied);
        }
        
    }
}
