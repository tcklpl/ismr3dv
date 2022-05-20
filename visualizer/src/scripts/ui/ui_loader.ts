import { SizeNameUtils } from "../visualizer/utils/size_name_utils";
import { IUI } from "./i_ui";

export class UILoader implements IUI {

    registerEvents() {
        
    }

    updateStatus(percentage: number, message: string) {
        $('#loading-progress-bar').attr('aria-valuenow', percentage).css('width', `${percentage}%`);
        $('#loading-message-percentage').html(`${SizeNameUtils.truncateNumber(percentage, 1)}%`);
        $('#loading-message').html(message);
    }

    hideLoadingScreen() {
        $('#loading-screen').fadeOut();
    }

}