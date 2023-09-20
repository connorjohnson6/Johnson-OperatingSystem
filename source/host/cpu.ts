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

//Most of this code is going to be from refrenece of chatGPT. I am currently taking comp. Org&Arch in relation to OS
//so most of this code I am not very familiar with, however I want to note that I am not just giving it a prompt and 
//accepting the code it produces, I am more making chatGPT be a third teacher through all of this and making it prompt
//me with long, in-depth explinations regarding any code it produces so that I can benefit from it and learn from it to get
//me ready for when I have to complete the 6502 processor with professor Gormanly this semester.

     module TSOS {

        let _Memory = new TSOS.Memory();
        let _MemoryAccessor = new TSOS.MemoryAccessor(_Memory);

        export class Cpu {
    
            constructor(public PC: number = 0,
                        public Acc: number = 0,
                        public Xreg: number = 0,
                        public Yreg: number = 0,
                        public Zflag: number = 0,
                        public isExecuting: boolean = false) {
    
            }
    
            public init(): void {
                this.PC = 0;
                this.Acc = 0;
                this.Xreg = 0;
                this.Yreg = 0;
                this.Zflag = 0;
                this.isExecuting = false;
            }
    
            public cycle(): void {
                _Kernel.krnTrace('CPU cycle');
    
                // Fetch
                let opCode = _MemoryAccessor.read(this.PC);
                this.PC++;
    
                // Decode and Execute
                switch(opCode) {
                    case "A9": // LDA with a constant
                        this.Acc = _MemoryAccessor.read(this.PC);
                        this.PC++;
                        break;
    
                    case "AD": // LDA from memory
                        let address = this.fetchAddress();
                        this.Acc = _MemoryAccessor.readFromAddress(address);
                        break;
    
                    case "8D": // STA (Store the accumulator in memory)
                        let storeAddress = this.fetchAddress();
                        _MemoryAccessor.write(storeAddress, this.Acc);
                        break;
    
                    case "6D": // ADC (Add with carry)
                        let addAddress = this.fetchAddress();
                        let value = _MemoryAccessor.readFromAddress(addAddress);
                        this.Acc += value;
                        // TODO: Handle carry if the result is greater than 255
                        break;
    
                    case "A2": // LDX with a constant
                        this.Xreg = _MemoryAccessor.read(this.PC);
                        this.PC++;
                        break;
    
                    case "AE": // LDX from memory
                        let xAddress = this.fetchAddress();
                        this.Xreg = _MemoryAccessor.readFromAddress(xAddress);
                        break;
    
                    case "A0": // LDY with a constant
                        this.Yreg = _MemoryAccessor.read(this.PC);
                        this.PC++;
                        break;
    
                    case "AC": // LDY from memory
                        let yAddress = this.fetchAddress();
                        this.Yreg = _MemoryAccessor.readFromAddress(yAddress);
                        break;
    
                    case "EA": // NOP (No Operation)
                        // Do nothing
                        break;
    
                    case "00": // BRK (Break, a system call)
                        // TODO: Implement system call handling
                        break;
    
                    case "EC": // CPX (Compare a byte in memory to the X register)
                        let compareAddress = this.fetchAddress();
                        let compareValue = _MemoryAccessor.readFromAddress(compareAddress);
                        this.Zflag = (this.Xreg === compareValue) ? 1 : 0;
                        break;
    
                    case "D0": // BNE (Branch n bytes if Z flag = 0)
                        let branchValue = _MemoryAccessor.read(this.PC);
                        if (this.Zflag === 0) {
                            this.PC += branchValue;
                        } else {
                            this.PC++;
                        }
                        break;
    
                    case "EE": // INC (Increment the value of a byte)
                        let incAddress = this.fetchAddress();
                        let incValue = _MemoryAccessor.readFromAddress(incAddress);
                        _MemoryAccessor.write(incAddress, incValue + 1);
                        break;
    
                    case "FF": // SYS (System Call)
                        // TODO: Implement system call handling
                        break;
    
                    default:
                        // Handle unknown op codes
                        console.error("Unknown op code:", opCode);
                        break;
                }
            }
    
            // Helper function to fetch a 16-bit address from memory
            private fetchAddress(): number {
                let lowByte = _MemoryAccessor.read(this.PC);
                this.PC++;
                let highByte = _MemoryAccessor.read(this.PC);
                this.PC++;
                return (highByte << 8) + lowByte;
            }
        }
    }
    