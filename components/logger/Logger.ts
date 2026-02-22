export default class Logger {
    
    static log(data: any, isObject: boolean = false, name: string = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`) {
        if (isObject) {
            console.log(name, JSON.stringify(data, null, 2));
        } else {
            console.log(name, data);
        }
    }
}