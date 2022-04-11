
export class UILoader {

    updateStatus(percentage: number, message: string) {
        $('#loading-progress-bar').attr('aria-valuenow', percentage).css('width', `${percentage}%`);
        $('#loading-message').html(message);
    }

    hideLoadingScreen() {
        $('#loading-screen').fadeOut();
    }

}