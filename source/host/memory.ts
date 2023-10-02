module TSOS {
    export class Memory {
        private memory: number[];

        constructor() {
            this.memory = new Array(256).fill(0);
        }

        public init() {
            this.memory.fill(0);
        }

        
    }



    
}
