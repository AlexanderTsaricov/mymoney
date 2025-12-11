export default class DBException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DBException';
    }
}
