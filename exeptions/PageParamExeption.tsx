export default class PageParamExeption extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PageParamExeption';
    }
}