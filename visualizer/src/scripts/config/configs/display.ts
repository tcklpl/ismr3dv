import { IKeyedConfiguration } from "../i_keyed_configuration";

export class DisplayConfig implements IKeyedConfiguration {
    key = 'display';

    exposure = 1;
    gamma = 2.2;
}