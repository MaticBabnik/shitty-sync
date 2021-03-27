module.exports = {
    average(array) {
        return array.reduce((p,c)=>p+c,0) / array.length;
    },
    sort(array) {
        return array.sort((a,b)=> a>b ? 1 : -1);
    },
    ignoreWorst(array) {
        return this.sort(array).splice(2,array.length-4);
    }
}