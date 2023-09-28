module TSOS {
    export class Memory {
        private memory: number[];

        constructor() {
            this.memory = new Array(256).fill(0);
        }

        public init() {
            this.memory.fill(0);
        }


        //credit from looking at the hall of fame KeeDOS
        public static updateMemory(address: number, value: number): void {
            const column = (address % 8) + 2;
            const row = Math.floor(address / 8) + 1;
            const cellSelector = `#memoryTable > tr:nth-child(${row}) > td:nth-child(${column})`;
            
            const cell = document.querySelector<HTMLDataElement>(cellSelector);
            if (cell) {
                cell.innerText = Utils.toHexString(value, 2);
            }
        }
    }



    
}
