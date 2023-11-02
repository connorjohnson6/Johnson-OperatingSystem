module TSOS {
    export class Dispatcher {

        public executeProcess(pcb): void {
            if (pcb.state !== "Terminated") {
                console.log(`Executing Process ${pcb.pid}`);
                this.loadState(pcb);
                _CPU.isExecuting = true;
            } else {
                console.log(`Process ${pcb.pid} is already terminated.`);
            }
        }

        public saveState(pcb): void {
            if (pcb) {
                pcb.PC = _CPU.PC;
                pcb.Acc = _CPU.Acc;
                pcb.Xreg = _CPU.Xreg;
                pcb.Yreg = _CPU.Yreg;
                pcb.Zflag = _CPU.Zflag;
                
                // Update state of the PCB to "Waiting"
                pcb.state = "Waiting";

            }
        }
        
        public loadState(pcb): void {
            _CPU.PC = pcb.PC;
            _CPU.Acc = pcb.Acc;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.Zflag;
            _CPU.currentPCB = pcb;
        
            // Update the state of the PCB to "Running"
            pcb.state = "Running";

        }
        
        public contextSwitch(oldPCB, newPCB): void {
            this.saveState(oldPCB); // Save state of the currently executing process
            oldPCB.state = "Waiting"; // Or any appropriate status you want to assign
            newPCB.state = "Running"; // Setting the new PCB's state as running
            this.loadState(newPCB); // Load state for the next process to execute
        }
        
        
    }
}