
export class UILoader {

    static updateStatus(percentage: number, message: string) {
        $('#loading-progress-bar').attr('aria-valuenow', percentage).css('width', `${percentage}%`);
        $('#loading-message').html(message);
    }

    static hideLoadingScreen() {
        $('#loading-screen').fadeOut();
    }

}