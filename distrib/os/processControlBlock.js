var TSOS;
(function (TSOS) {
    class PCB {
        pid = 0;
        location = "Memory";
        PC = 0;
        IR = 0;
        Acc = 0;
        Xreg = 0;
        Yreg = 0;
        Zflag = 0;
        state = "Resident";
        base = 0;
        limit = 0;
        priority = 0;
        arrivalTime;
        completionTime = null;
        burstTime = null;
        turnaroundTime = null;
        waitTime = 0;
        quantumRemaining = _Scheduler.quantum;
        segment = null;
        constructor(pid, base, limit) {
            if (pid !== undefined) {
                this.pid = pid;
            }
            if (base !== undefined) {
                this.base = base;
            }
            if (limit !== undefined) {
                this.limit = limit;
            }
        }
        updateState(newState) {
            this.state = newState;
        }
        reset() {
            this.PC = this.base;
            this.IR = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.state = "Resident";
            this.waitTime = 0;
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map