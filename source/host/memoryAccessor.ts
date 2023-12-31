module TSOS {

    
    export class MemoryAccessor {

        constructor() {}

        public init(){}

        //Read a byte from a specific address in memory.
        public read(address: number, base?: number): number {
            const actualBase = base !== undefined ? base : (_CPU.currentPCB.base ? _CPU.currentPCB.base : 0);
            const actualAddress = address + actualBase;
            this.highlightMemoryCell(actualAddress);
            let value = _Memory[actualAddress];
            this.unhighlightMemoryCell(actualAddress);
            return value;
        }
        


        // Write a byte to a specific address in memory.
        public write(address: number, value: number, base?: number): void {
            const actualBase = base !== undefined ? base : (_CPU.currentPCB.base ? _CPU.currentPCB.base : 0);
            const actualAddress = address + actualBase;
            this.highlightMemoryCell(actualAddress);
            _Memory[actualAddress] = value;
            //console.log(`Memory content at address ${actualAddress}:`, _Memory[actualAddress]);

            TSOS.Control.updateMemory(actualAddress, value);
            this.unhighlightMemoryCell(actualAddress);
        }


        public static clearMemory(base: number, limit: number): void {
            for (let i = base; i <= limit; i++) {
                _Memory[i] = 0;
                TSOS.Control.updateMemory(i, 0);
            }
        }

        
        public clearPartition(base: number, limit: number): void {
            // Loop through each address in the partition
            for (let address = base; address < limit; address++) {
                // Write 0 to each address
                this.write(address, 0, 0);
            }
        }
        


        private highlightMemoryCell(address: number): void {
            //console.log("Highlighting address: ", address); // Debugging line
            const column = (address % 8) + 2;
            const row = Math.floor(address / 8) + 1;
            const cellSelector = `#memoryTable > tr:nth-child(${row}) > td:nth-child(${column})`;
            const cell = document.querySelector<HTMLDataElement>(cellSelector);
            if (cell) {
                cell.classList.add('highlighted');
                cell.classList.remove('normal');
            }
        }
        
        private unhighlightMemoryCell(address: number): void {
            setTimeout(() => {
                const column = (address % 8) + 2;
                const row = Math.floor(address / 8) + 1;
                const cellSelector = `#memoryTable > tr:nth-child(${row}) > td:nth-child(${column})`;
                const cell = document.querySelector<HTMLDataElement>(cellSelector);
                if (cell) {
                    cell.classList.add('normal');
                    cell.classList.remove('highlighted');
                }
            }, 500);  // Delay unhighlighting for 500 milliseconds
        }
        
    }
}