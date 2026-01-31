export default class CreateDataExeption extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CreateDataExeption';
    }
}