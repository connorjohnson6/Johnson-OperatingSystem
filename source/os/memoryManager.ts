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
        
        
        
        
        
        public unloadProcess(pcb: PCB): void {
            const partition = this.findPartitionByPID(pcb.pid);
            if (partition) {
                //clear memory/update state when processes is terminated  
                this.clearMemory(partition.base, partition.limit);
                partition.occupied = false;
                partition.pcb = undefined;
                pcb.state = "Terminated";
                _PCBMap.delete(pcb.pid);
                _Scheduler.residentList.delete(pcb.pid);
            }
        }
        

        public clearMemory(base: number, limit: number): void {
            //goes through memory and clears
            for (let i = base; i <= limit; i++) {
                _MemoryAccessor.write(i - base, 0, base);
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
                    this.clearMemory(partition.base, partition.limit);
                    partition.occupied = false;
                    partition.pcb = undefined;
                }
            });
        }

        //some chatGPT suggested methods to help me fix my problem with only PID 1 not being terminated
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
        
    }
}