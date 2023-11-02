/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */




//Most of this code is going to be from refrenece of chatGPT/hall of fame work. I am currently taking comp. Org&Arch in relation to OS
//so most of this code I am not very familiar with, however I want to note that I am not just giving it a prompt and 
//accepting the code it produces, I am more making chatGPT be a third teacher through all of this and making it prompt
//me with long, in-depth explinations regarding any code it produces so that I can benefit from it and learn from it to get
//me ready for when I have to complete the 6502 virtual processor with professor Gormanly this semester.

module TSOS {

    export class Cpu {
        public currentPCB: TSOS.PCB = null;

        public singleStepMode: boolean = false;

        

        constructor(
                    public PC: number = 0, //program counter
                    public IR: number = 0, //instruction reg
                    public Acc: number = 0, //accumulator
                    public Xreg: number = 0, //X reg
                    public Yreg: number = 0, //Y reg
                    public Zflag: number = 0, //Z flag
                    public isExecuting: boolean = false //later for ctr-c
                    ) {

        }


        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public fetch(): number {
            this.IR = _MemoryAccessor.read(this.PC++);
            return this.IR;
        }
        //Just some testing for cpu
        // public cpuLog() {
        //     //logging information for each member of CPU class
        //     console.log("PC: " + TSOS.Utils.toHexString(this.PC) + "\n" +
        //         "IR: " + TSOS.Utils.toHexString(this.IR) + "\n" +
        //         "Acc: " + TSOS.Utils.toHexString(this.Acc) + "\n" +
        //         "xReg: " + TSOS.Utils.toHexString(this.Xreg) + "\n" +
        //         "yReg: " + TSOS.Utils.toHexString(this.Yreg) + "\n" +
        //         "zFlag: " + TSOS.Utils.toHexString(this.Zflag));
        //     console.log("---------------------------------------");
        // }

        


        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');

            // console.log("Current PCB:", this.currentPCB);
            // console.log("Program Counter:", this.PC);

            let opCode = this.fetch();


            if (_Scheduler.schedulingAlgorithm === "rr") {
                if (_Scheduler.cycles >= _Scheduler.quantum) {
                    _Scheduler.contextSwitch(); // This might involve saving and loading CPU states
                }
            }

            // console.log("Fetched OpCode:", opCode);

            
            //Testing console.log for results, will get toString() errors
            // if (opCodeNum === undefined || opCodeNum === 0) {
            //     // If you have specific handling for opcode 00, you might want to do it here
            //     if (opCodeNum === 0) {
            //         // Handle opcode 00 - no operation or halt
            //         // For example, you might want to set isExecuting to false and return
            //         this.isExecuting = false;
            //         console.log('Received halt opcode');
            //         return;
            //     }
            //     console.error('opCodeNum is undefined');
            //     return;
            // }

            //const opCodeNum = opCode.toString(16).toUpperCase().padStart(2, '0');

            //console.log(opCodeNum);
            //console.log(this.cpuLog());

            // Decode and Execute
            switch(opCode) {
                //Load the accumulator with a constant 
                case 0xA9:
                    this.Acc = _MemoryAccessor.read(this.PC);
                    this.PC++;
                    break;

                //Load the accumulator from memory
                case 0xAD: 
                    let address = this.fetchAddress1(this.PC);

                    this.Acc = _MemoryAccessor.read(address);
                    break;

                //Store the accumulator in memory
                case 0x8D: 
                    let storeAddress = this.fetchAddress();

                    _MemoryAccessor.write(storeAddress, this.Acc);
                    break;

                //Add with carry
                    //Adds contents of an address to
                    //the contents of the accumulator and
                    //keeps the result in the accumulator
                case 0x6D: 
                    let addAddress = this.fetchAddress1(this.PC);

                    this.PC += 2;
                    let value = _MemoryAccessor.read(addAddress);
                    let result = this.Acc + value;
                    
                    // Handle overflow
                    if (result > 255) {
                        // Set the accumulator to result modulo 256
                        this.Acc = result % 256;
                    } else {
                        this.Acc = result;
                    }
                    break;
                    
                //Load the X register with a constant 
                case 0xA2: 
                    this.Xreg = _MemoryAccessor.read(this.PC);
                    this.PC++;
                    break;

                //Load the X register from memory
                case 0xAE: 
                    let xAddress = this.fetchAddress1(this.PC);

                    this.PC += 2;
                    this.Xreg = _MemoryAccessor.read(xAddress);
                    break;

                //Load the Y register with a constant
                case 0xA0: 
                    this.Yreg = _MemoryAccessor.read(this.PC);
                    this.PC++;
                    break;

                //Load the Y register from memory 
                case 0xAC: 
                    let yAddress = this.fetchAddress1(this.PC);

                    this.PC += 2;
                    this.Yreg = _MemoryAccessor.read(yAddress);
                    break;

                //No Operation 
                case 0xEA: 
                    // Do nothing
                    break;

                //Break (which is really a system call) 
                case 0x00: 
                    console.log(`Preparing to terminate Process ${_CPU.currentPCB.pid}`);

                    _CPU.isExecuting = false;
                    if (_CPU.currentPCB) {
                        _CPU.currentPCB.state = "Terminated";
                        _MemoryManager.unloadProcess(_CPU.currentPCB); 
                        _StdOut.advanceLine();

                        _StdOut.putText(`Process ${_CPU.currentPCB.pid} terminated`);

                        _StdOut.advanceLine();
                        
                    } else {
                        console.error("No current PCB found when trying to terminate process");
                    }
                break;


                //Compare a byte in memory to the X reg
                case 0xEC: 
                    let compareAddress = this.fetchAddress1(this.PC);

                    this.PC += 2;
                    let compareValue = _MemoryAccessor.read(compareAddress);
                    //Sets the Z (zero) flag if equal/
                    this.Zflag = (this.Xreg === compareValue) ? 1 : 0;
                    break;

                //Branch n bytes if Z flag = 0
                case 0xD0: 
                    let branchValue = _MemoryAccessor.read(this.PC);
                    this.PC++;
                    if (this.Zflag === 0) {
                        this.PC += branchValue;
                        //part from KeeDos to test with a working project to see if my project aint shit
                        //loops back to check previous--needed
                        if(this.PC > 0xFF){
                            this.PC -= 0x100;
                        }
                    } 
                    break;

                //Increment the value of a byte
                case 0xEE:
                    let incAddress = this.fetchAddress1(this.PC);

                    this.PC += 2;
                    let incValue = _MemoryAccessor.read(incAddress);

                    //looking for potention infite loops due to it exceeding memory limit
                    if(incValue > 0xFF){

                        // Terminate process or take other appropriate action
                        _CPU.isExecuting = false;
                        _CPU.init();  // re-initialize or clear CPU state

                        if (_CPU.currentPCB) {
                            _CPU.currentPCB.state = "Terminated";
                            TSOS.Control.updatePCBs();
                            _StdOut.putText(`Process ${_CPU.currentPCB.pid} has been manually terminated`);
                        
                            
                        }

                        Kernel.krnTrapError("Potential infinite loop detected: too many write operations");

                    }else{
                        _MemoryAccessor.write(incAddress, incValue + 1);

                    }
                    break;

                //System Call 
                case 0xFF: 
                    if (this.Xreg === 1) {
                        // Print integer stored in the Y register
                        _Console.putText(this.Yreg.toString());
                    } else if (this.Xreg === 2) {
                        // Print 00-terminated string stored at the address in the Y register
                        let address = this.Yreg;
                        let byte = _MemoryAccessor.read(address);
                        while (byte !== 0x00) {
                            _Console.putText(String.fromCharCode(byte));
                            byte = _MemoryAccessor.read(++address);
                        }
                        
                    }
                    break;

                default:
                    console.error(`Unknown opcode: ${opCode}`);
                    // You might want to terminate the current process or take some other action here
                    this.isExecuting = false;
                    break;

            }

            this.saveStateToPCB(this.currentPCB);

            TSOS.Control.updateCPU();
            TSOS.Control.updatePCBs();
            

        }

        public loadStateFromPCB(pcb: TSOS.PCB): void {
            this.PC = pcb.PC;
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
        }

        public saveStateToPCB(pcb: TSOS.PCB): void {
            pcb.PC = this.PC;
            pcb.Acc = this.Acc;
            pcb.Xreg = this.Xreg;
            pcb.Yreg = this.Yreg;
            pcb.Zflag = this.Zflag;
        }


        // Helper function to fetch a 16-bit address from memory
        //only using this for 0x8D. For some reason I accidentally didn't change that one
        //to fetchAddress1 and it worked. If I change it, it just won't work so Happy Error :)
        private fetchAddress(): number {
            let lowByte = _MemoryAccessor.read(this.PC);
            this.PC++;
            let highByte = _MemoryAccessor.read(this.PC);
            this.PC++;
            return (highByte << 8) + lowByte;
        }

        private fetchAddress1(PC: number): number {
            // Read the low order byte and high order byte from memory.
            let lowByte = _MemoryAccessor.read(PC);
            let highByte = _MemoryAccessor.read(PC + 1);
        
            // Check for undefined or null.
            if (lowByte == null || highByte == null) {
                console.error(`Error reading memory at address ${PC}.`);
                return -1;  
            }
        
            // Combine the HOB and LOB to form the address. 
            // Left shift the HOB by 8 bits, then bitwise OR with the LOB.
            //chatGPT help
            let address = (highByte << 8) | lowByte;
        
            return address;
        }


    }
    
}