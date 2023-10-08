var TSOS;
(function (TSOS) {
    class Memory {
        memory;
        constructor() {
            this.memory = new Array(256).fill(0);
        }
        init() {
            this.memory.fill(0);
        }
        static loadIntoMemory(taProgramInput) {
            // Split the input by spaces to get individual op codes
            let opCodes = taProgramInput.split(/\s+/);
            TSOS.MemoryManager.memorySpot(opCodes);
            // Assign a PID 
            let pid = _PIDCounter++;
            //delete later as this will involve memory manager
            if (pid < 3) {
                // Initialize the PCB
                let pcb = new TSOS.PCB(pid);
                pcb.state = "Ready";
                _PCBMap.set(pid, pcb);
                // Initialize other PCB properties if necessary
                TSOS.Control.updatePCBs();
                _StdOut.putText(`Op codes loaded into memory with PID: ${pid}.`);
            }
            else {
                // Handle the case where there is no more memory or PID limit is reached
                _StdOut.putText(`No more memory ... Must run a PID to load more input`);
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map