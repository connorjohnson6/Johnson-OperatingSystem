var TSOS;
(function (TSOS) {
    class MemoryManager {
        static BLOCK_SIZE = 0xFF; // 256
        // Define partitions with base and limit addresses
        partitions = [
            { base: 0x000, limit: 0x0FF, occupied: false },
            { base: 0x100, limit: 0x1FF, occupied: false },
            { base: 0x200, limit: 0x2FF, occupied: false }
        ];
        constructor() { }
        loadProcess(pid, opCodes) {
            console.log("Partitions before loading:", this.partitions); // Log the state of partitions
            // Find an available partition
            const partition = this.partitions.find(p => !p.occupied);
            console.log("Found partition:", partition); // Log the found partition
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
                _MemoryAccessor.write(i, parseInt(opCodes[i], 16), partition.base);
            }
            partition.occupied = true;
            partition.pid = pid;
        }
        unloadProcess(pid) {
            // Find the partition assigned to the process and free it
            const partition = this.partitions.find(p => p.pid === pid);
            if (partition) {
                partition.occupied = false;
                partition.pid = undefined;
            }
        }
        findPartitionByPID(pid) {
            // Iterating over each partition to find a match with the given PID
            for (let partition of this.partitions) {
                if (partition.pid === pid) {
                    return partition; // Return the matching partition
                }
            }
            return null; // Return null if no matching partition is found
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map