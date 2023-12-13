module TSOS {
    export class MemoryManager {
        private static readonly BLOCK_SIZE = 0xFF; // 256
        
        // Array to manage memory partitions
        private partitions: { base: number, limit: number, occupied: boolean, pcb?: PCB }[] = [
            { base: 0x000, limit: 0x0FF, occupied: false },
            { base: 0x100, limit: 0x1FF, occupied: false },
            { base: 0x200, limit: 0x2FF, occupied: false }
        ];
        
        constructor() {}
        
        // Load a process into memory and return true if successful, false otherwise
        public loadProcess(pcb: PCB, opCodes: string[]): boolean {
            console.log("Received PCB at start:", JSON.stringify(pcb));

            const partition = this.findAvailablePartition();
            console.log(`Partition: ${partition}`)
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
            pcb.location = "Memory";

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

        public loadDisk(pcb: PCB): boolean {
            let filename = `.swap${pcb.pid}`;
        
            // Check if the swap file exists for this PCB
            let fileExists = _krnKeyboardDisk.findDirEntry(filename);
            if (!fileExists) {
                _StdOut.putText(`No file found for .swap${pcb.pid} on disk.`);
                return false;
            }
        
            // Update PCB properties
            pcb.location = "Disk";
            pcb.segment = NaN; // just going to use NaN since its not coming from memory
            pcb.base = NaN;
            pcb.limit = NaN;
        

            _PCBMap.set(pcb.pid, pcb);
            _Scheduler.residentList.set(pcb.pid, pcb);

            
            // Update any relevant displays or logs
            TSOS.Control.updatePCBs(); 
            _IsDiskLoaded = true;
        
            console.log(`Process with PID: ${pcb.pid} loaded from disk.`);
            return true;
        }

        
        
        
        
        public unloadProcess(pcb: PCB): void {
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
            } else {
                console.error(`No occupied partition found for PID: ${pcb.pid}, or PCB mismatch.`);
            }
        }
        
        
        

        public findPartitionByPID(pid: number): { base: number, limit: number, occupied: boolean, pcb?: PCB } | null {
            console.log("Searching for partition with PID:", pid);
            const foundPartition = this.partitions.find(p => p.pcb?.pid === pid);
            if (!foundPartition) {
                console.log("No partition found for PID:", pid);
                return null;
            }
            console.log("Found partition:", foundPartition);
            return foundPartition;
        }
        
        
        public clearAll(): void {
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
        public markPartitionAsAvailable(base: number, limit: number): void {
            let partition = this.findPartition(base, limit);
            if (partition) {
                partition.occupied = false;
            }
        }
        
        public findPartition(base: number, limit: number): { base: number, limit: number, occupied: boolean, pcb?: PCB } | null {
            return this.partitions.find(partition => partition.base === base && partition.limit === limit) || null;
        }
        
        
        public findAvailablePartition(): { base: number, limit: number, occupied: boolean, pcb?: PCB } | null {
            return this.partitions.find(p => !p.occupied) || null;
        }

        public findProcessByPID(pid: number): PCB | null {
            const foundPartition = this.findPartitionByPID(pid);
            return foundPartition?.pcb || null;
        }

        // Method to load op codes into a specific memory partition
        public loadIntoPartition(partition: { base: number, limit: number, occupied: boolean, pcb?: PCB }, opCodes: string): boolean {
        if (partition.occupied) {
            console.error(`Partition is already occupied. Cannot load process.`);
            return false;
        }

        // Split the op codes string into an array of op codes
        let opCodesArray = opCodes.split(" ");

        // Check if the opCodes exceed the block size
        if (opCodesArray.length > MemoryManager.BLOCK_SIZE) {
            console.error("Input exceeds block size.");
            return false;
        }

        // Load the op codes into memory
        for (let i = 0; i < opCodesArray.length; i++) {
            const opcode = parseInt(opCodesArray[i], 16);
            _MemoryAccessor.write(i, opcode, partition.base);
        }

        // Mark the partition as occupied
        partition.occupied = true;

        return true;
    }
        
    }
}