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

            pcb.state = "Running";
        }
        
        public contextSwitch(oldPCB, newPCB): void {
            if (oldPCB !== null && oldPCB.state !== "Terminated") {
                oldPCB.state = "Waiting";
                this.saveState(oldPCB);
                _Scheduler.readyQueue.enqueue(oldPCB); // Re-add the current process if it's not terminated
            }
            
            if (newPCB !== null) {
                if (_Scheduler.readyQueue.getSize() > 0) {
                    _Scheduler.readyQueue.dequeue(); // Remove newPCB from the ready queue as it is now current
                }
                this.loadState(newPCB);
                _CPU.currentPCB = newPCB; // Make newPCB the currently executing process
                newPCB.state = "Running";
                _CPU.isExecuting = true; // Set the CPU to executing
                console.log(`Context Switched to PID: ${newPCB.pid}`);
            } else {
                 // No process is currently running
                _CPU.isExecuting = false; 
                _CPU.currentPCB = null;

            }
        }
        
    
        // Roll in a PCB from Disk to Memory
        public rollIn(newPCB: PCB): void {
            if (newPCB) {
                console.log(`[RollIn] Rolling in PID: ${newPCB.pid}`);
                newPCB.location = 'Memory';


                console.log(`[RollIn] PID: ${newPCB.pid} location set to 'Memory'`);
            }
        }
        
        // Roll out a PCB from Memory to Disk
        public rollOut(oldPCB: PCB): void {
            if (oldPCB) {
                console.log(`[RollOut] Rolling out PID: ${oldPCB.pid}`);
                oldPCB.location = 'Disk';


                console.log(`[RollOut] PID: ${oldPCB.pid} location set to 'Disk'`);
            }
        }
        
        
    }
}