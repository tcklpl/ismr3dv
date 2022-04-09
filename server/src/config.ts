export class Config {
    
    static instance: Config;

    private _apiKey: string;

    constructor(apikey: string) {
        this._apiKey = apikey;
        Config.instance = this;
    }

    get hasApiKey() {
        return this._apiKey != "";
    }

    get apiKey() {
        return this._apiKey;
    }

}