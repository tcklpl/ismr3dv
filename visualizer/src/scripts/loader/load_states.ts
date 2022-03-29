export enum LoadState {
    // MAIN
    FETCHING_MAIN_LOADLIST = 0,
    FETCHING_INDIVIDUAL_LOADLISTS = 1,

    // HTML
    FETCHING_HTML_PARTS = 2,
    APPENDING_HTML_PARTS = 3,

    // MATERIALS
    FETCHING_MATERIALS = 4,
    CONSTRUCTING_MATERIALS = 5,

    // MESHES
    FETCHING_MESHES = 6,
    CONSTRUCTING_MESHES = 7,

    // SHADERS
    FETCHING_SHADERS = 8,
    COMPILING_SHADERS = 9,

    // GAME OBJECTS
    FETCHING_GAME_OBJECTS = 10,
    REGISTERING_GAME_OBJECTS = 11,

    FINISHED = 12
}