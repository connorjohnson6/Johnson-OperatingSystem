/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the JavaScript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */
var TSOS;
(function (TSOS) {
    class Queue {
        q;
        constructor(q = new Array()) {
            this.q = q;
        }
        getSize() {
            return this.q.length;
        }
        isEmpty() {
            return (this.q.length == 0);
        }
        enqueue(element) {
            this.q.push(element);
        }
        dequeue() {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }
        peek() {
            if (this.q.length > 0) {
                return this.q[0];
            }
            else {
                return null;
            }
        }
        toString() {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
        remove(pcb) {
            const index = this.q.indexOf(pcb);
            if (index > -1) {
                this.q.splice(index, 1);
            }
        }
        //only using for console.logs 
        toArray() {
            return [...this.q];
        }
    }
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=queue.js.map