var TSOS;
(function (TSOS) {
    class MemoryManager {
        static BLOCK_SIZE = 0xFF; // 256
        // Array to manage memory partitions
        partitions = [
            { base: 0x000, limit: 0x0FF, occupied: false },
            { base: 0x100, limit: 0x1FF, occupied: false },
            { base: 0x200, limit: 0x2FF, occupied: false }
        ];
        constructor() { }
        // Load a process into memory and return true if successful, false otherwise
        loadProcess(pcb, opCodes) {
            console.log("Received PCB at start:", JSON.stringify(pcb));
            const partition = this.findAvailablePartition();
            // Check if there's no available partition or if the opCodes exceed the block size
            if (!partition || opCodes.length > MemoryManager.BLOCK_SIZE) {
                console.error("No available partition found or Input exceeds block size for process:", pcb.pid);
                return false;
            }
            //assinging properties to the PCB based off of the availble/found partitions
            const segment = this.partitions.indexOf(partition);
            pcb.segment = segment;
            pcb.base = partition.base;
            pcb.limit = partition.limit;
            this.partitions[segment].occupied = true;
            this.partitions[segment].pcb = pcb;
            //set/update gloabals
            _PCBMap.set(pcb.pid, pcb);
            _Scheduler.residentList.set(pcb.pid, pcb);
            console.log("Assigned PCB to partition:", partition);
            TSOS.Control.updatePCBs();
            console.log("Partition after assignment:", partition);
            console.log("PCB after assignment:", pcb);
            //witing into memory
            for (let i = 0; i < opCodes.length; i++) {
                const opcode = parseInt(opCodes[i], 16);
                _MemoryAccessor.write(i, opcode, partition.base);
            }
            console.log("Partition after loading process:", partition);
            return true;
        }
        unloadProcess(pcb) {
            console.log(`Attempting to unload process with PID: ${pcb.pid}`);
            // Check if the process has already been terminated to avoid repeated unloading
            if (pcb.state === "Terminated") {
                console.log(`Process with PID: ${pcb.pid} has already been terminated and unloaded.`);
                return;
            }
            const partition = this.findPartitionByPID(pcb.pid);
            // Make sure the partition exists and the pcb matches the partition's pcb before unloading
            if (partition && partition.occupied && partition.pcb === pcb) {
                console.log(`Clearing memory for process with PID: ${pcb.pid}`);
                console.log(`Clearing from base: ${partition.base.toString(16)} to limit: ${partition.limit.toString(16)}`);
                _MemoryAccessor.clearPartition(partition.base, partition.limit);
                // Mark the partition as not occupied and remove the pcb from the partition
                partition.occupied = false;
                partition.pcb = undefined;
                // Update the state of the pcb to 'Terminated'
                pcb.state = "Terminated";
                // Remove the pcb from PCBMap and the residentList as it's no longer active
                _PCBMap.delete(pcb.pid);
                _Scheduler.residentList.delete(pcb.pid);
                console.log(`Process with PID: ${pcb.pid} unloaded successfully.`);
            }
            else {
                console.error(`No occupied partition found for PID: ${pcb.pid}, or PCB mismatch.`);
            }
        }
        findPartitionByPID(pid) {
            console.log("Searching for partition with PID:", pid);
            const foundPartition = this.partitions.find(p => p.pcb?.pid === pid);
            if (!foundPartition) {
                console.log("No partition found for PID:", pid);
                return null;
            }
            console.log("Found partition:", foundPartition);
            return foundPartition;
        }
        clearAll() {
            this.partitions.forEach(partition => {
                if (partition.occupied) {
                    // Call the updated clearMemory with the base and limit of the partition
                    _MemoryAccessor.clearPartition(partition.base, partition.limit);
                    // Unload the process separately
                    this.unloadProcess(partition.pcb);
                    partition.occupied = false;
                    partition.pcb = undefined;
                }
            });
        }
        //some chatGPT suggested methods to help me fix my problem with only PID 1 not being terminated
        //we fixed that shit though babyyyyyy!!!!!!!!!!
        markPartitionAsAvailable(base, limit) {
            let partition = this.findPartition(base, limit);
            if (partition) {
                partition.occupied = false;
            }
        }
        findPartition(base, limit) {
            return this.partitions.find(partition => partition.base === base && partition.limit === limit) || null;
        }
        findAvailablePartition() {
            return this.partitions.find(p => !p.occupied) || null;
        }
        findProcessByPID(pid) {
            const foundPartition = this.findPartitionByPID(pid);
            return foundPartition?.pcb || null;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map