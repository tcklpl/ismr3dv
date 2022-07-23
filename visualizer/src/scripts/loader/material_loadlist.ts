
export interface MaterialLoadlist {

    materials: [
        {
            name: string;
            maps: string[];
            resolutions: string[];
            default_resolution: string;
            cube_map?: boolean;
            images: [
                {
                    resolution: string;
                    maps: any;
                }
            ]
        }
    ]

}