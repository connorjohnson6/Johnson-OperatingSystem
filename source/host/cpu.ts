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

    export class Cpu {

        private _MemoryAccessor: MemoryAccessor

        constructor(
                    private opFetch: number = 0,
                    public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }


        public init(): void {
            this.PC = 0;
            this.opFetch = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        private fetch(): number {
            let instruction = this._MemoryAccessor.read(this.PC);
            this.PC++;
            return instruction;
        }


        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');

            this.opFetch = this.fetch();


            // Fetch
            let opCodeNum = this.opFetch;

            let opCode = opCodeNum.toString(16).toUpperCase().padStart(2, '0');

            // Decode and Execute
            switch(opCode) {
                //Load the accumulator with a constant 
                case "A9":
                    this.Acc = this._MemoryAccessor.read(this.PC);
                    this.PC++;
                    break;

                //Load the accumulator from memory
                case "AD": 
                    let address = this.fetchAddress();
                    this.Acc = this._MemoryAccessor.readFromAddress(address);
                    break;

                //Store the accumulator in memory
                case "8D": 
                    let storeAddress = this.fetchAddress();
                    this._MemoryAccessor.write(storeAddress, this.Acc);
                    break;

                //Add with carry
                    //Adds contents of an address to
                    //the contents of the accumulator and
                    //keeps the result in the accumulator
                case "6D": 
                    let addAddress = this.fetchAddress();
                    let value = this._MemoryAccessor.readFromAddress(addAddress);
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
                case "A2": 
                    this.Xreg = this._MemoryAccessor.read(this.PC);
                    this.PC++;
                    break;

                //Load the X register from memory
                case "AE": 
                    let xAddress = this.fetchAddress();
                    this.Xreg = this._MemoryAccessor.readFromAddress(xAddress);
                    break;

                //Load the Y register with a constant
                case "A0": 
                    this.Yreg = this._MemoryAccessor.read(this.PC);
                    this.PC++;
                    break;

                //Load the Y register from memory 
                case "AC": 
                    let yAddress = this.fetchAddress();
                    this.Yreg = this._MemoryAccessor.readFromAddress(yAddress);
                    break;

                //No Operation 
                case "EA": 
                    // Do nothing
                    break;

                //Break (which is really a system call) 
                case "00": 
                    // TODO: Implement system call handling
                    break;

                //Compare a byte in memory to the X reg
                case "EC": 
                    let compareAddress = this.fetchAddress();
                    let compareValue = this._MemoryAccessor.readFromAddress(compareAddress);
                    //Sets the Z (zero) flag if equal/
                    this.Zflag = (this.Xreg === compareValue) ? 1 : 0;
                    break;

                //Branch n bytes if Z flag = 0
                case "D0": 
                    let branchValue = this._MemoryAccessor.read(this.PC);
                    if (this.Zflag === 0) {
                        this.PC += branchValue;
                    } else {
                        this.PC++;
                    }
                    break;

                //Increment the value of a byte
                case "EE":
                    let incAddress = this.fetchAddress();
                    let incValue = this._MemoryAccessor.readFromAddress(incAddress);
                    this._MemoryAccessor.write(incAddress, incValue + 1);
                    break;

                //System Call 
                case "FF": 
                    if (this.Xreg === 0x01) {
                        // Print integer stored in the Y register
                        console.log(this.Yreg);
                    } else if (this.Xreg === 0x02) {
                        // Print 00-terminated string stored at the address in the Y register
                        let address = this.Yreg;
                        let str = "";
                        let byte = this._MemoryAccessor.read(address);
                        while (byte !== 0x00) {
                            str += String.fromCharCode(byte);
                            address++;
                            byte = this._MemoryAccessor.read(address);
                        }
                        console.log(str);
                    }
                    break;

                default:
                    // Handle unknown op codes
                    console.error("Unknown op code:", opCode);
                    break;
            }
        }

        // Helper function to fetch a 16-bit address from memory
        private fetchAddress(): number {
            let lowByte = this._MemoryAccessor.read(this.PC);
            this.PC++;
            let highByte = this._MemoryAccessor.read(this.PC);
            this.PC++;
            return (highByte << 8) + lowByte;
        }

    }

    
}
