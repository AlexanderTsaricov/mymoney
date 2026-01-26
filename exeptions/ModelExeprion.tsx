export default class ModelParamsExeption extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModelParamsExeption';
    }
}