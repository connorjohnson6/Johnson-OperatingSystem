module TSOS {

    
    export class MemoryAccessor {

        private writeCount: number = 0;
        private maxWriteCount: number = 0xFF; 

        constructor() {}

        public init(){}

        //Read a byte from a specific address in memory.
        public read(address: number): number {
            this.highlightMemoryCell(address);
            let value = _Memory[address];
            this.unhighlightMemoryCell(address);
            return value;
        }


        // Write a byte to a specific address in memory.
        public write(address: number, value: number): void {
            this.highlightMemoryCell(address);
            _Memory[address] = value;
            TSOS.Control.updateMemory(address, value);
            this.unhighlightMemoryCell(address);
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