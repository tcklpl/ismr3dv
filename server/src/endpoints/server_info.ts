import { Request, Response } from "express"
import { Config } from "../config";

export default {

    async sendServerInfo(request: Request, response: Response) {

        return response.status(200).json({
            showcase_mode: !Config.instance.hasApiKey,
            showcase_start_date: "2014-10-02T01:00:00.000Z",
            showcase_end_date: "2014-10-02T01:05:00.000Z"
        });
        
    },
}