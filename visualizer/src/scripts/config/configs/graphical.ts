import { IKeyedConfiguration } from "../i_keyed_configuration";

export type TextureSize2k8k = '2k' | '8k';

export class GraphicalConfig implements IKeyedConfiguration {
    key = 'graphical';

    resolution_scale = 1;
    bloom = true;
    earth_texture_size: TextureSize2k8k = '2k';
    sun_texture_size: TextureSize2k8k = '2k';
}