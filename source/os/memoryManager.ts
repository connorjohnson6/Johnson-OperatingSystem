module TSOS {
    export class MemoryManager {
        private static readonly BLOCK_SIZE = 0xFF; // 256
        
        // Define partitions with base and limit addresses
        private partitions: { base: number, limit: number, occupied: boolean, pid?: number }[] = [
            { base: 0x000, limit: 0x0FF, occupied: false },
            { base: 0x100, limit: 0x1FF, occupied: false },
            { base: 0x200, limit: 0x2FF, occupied: false }
        ];
        
        constructor() {}
        
        public loadProcess(pid: number, opCodes: string[]): void {            
            // Find an available partition
            const partition = this.partitions.find(p => !p.occupied);
                        
            if (!partition) {
                _StdOut.putText("Error: No available memory partitions.");
                return;
            }
            
            // Validate the input length
            if (opCodes.length > MemoryManager.BLOCK_SIZE) {
                _StdOut.putText("Error: Input exceeds block size.");
                return;
            }
            
            // Load the op codes into memory considering the base address of the partition
            for (let i = 0; i < opCodes.length; i++) {
                // Calculate the actual address where the opcode will be stored
                const actualAddress = i + partition.base;
                
                // Validate that the actual address is within the partition limits
                if (actualAddress <= partition.limit) {
                    const opcode = parseInt(opCodes[i], 16);
                    _MemoryAccessor.write(i, opcode, partition.base);
                } else {
                    return;
                }
            }

            // Updating the partition details
            partition.occupied = true;
            partition.pid = pid;



        }
        
        public unloadProcess(pid: number): void {
            // Find the partition assigned to the process and free it
            const partition = this.findPartitionByPID(pid);
            if (partition) {

                
                // Clear the memory occupied by the process
                for (let i = partition.base; i <= partition.limit; i++) {
                    _MemoryAccessor.write(i - partition.base, 0, partition.base);
                }
                

                // Update the partition metadata
                partition.occupied = false;
                partition.pid = undefined;

                
                // Update the memory display
                TSOS.Control.updateMemoryDisplay();
            }
        }
        
        

        public findPartitionByPID(pid: number): any {
            // Iterating over each partition to find a match with the given PID
            for (let partition of this.partitions) {
                if (partition.pid === pid) {
                    return partition; // Return the matching partition
                }
            }
            return null; // Return null if no matching partition is found
        }

        public findAvailablePartition(): any {
            return this.partitions.find(p => !p.occupied);
        }
        
    }
}
