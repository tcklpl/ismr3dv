
export interface MaterialLoadlist {

    materials: [
        {
            name: string;
            maps: string[];
            resolutions: string[];
            default_resolution: string;

            images: [
                {
                    resolution: string;
                    maps: any;
                }
            ]
        }
    ]

}