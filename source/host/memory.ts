module TSOS {
//    export class Memory extends Array<number>{

//         constructor() {
//             super();
//         }

//         // Initialize an array of 256 elements to represent the 256 bytes of memory.
//         // We fill it with zeros to start with a clean slate.
//         private memory: number[] = new Array(256).fill(0);


//         public init() {
//             this.fill(0)
//         }

//     }
// }
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
