
export class MessageScreen {

    constructor(title: string, description: string, onConfirm?: () => void) {

        $('#message-modal-title').html(title);
        $('#message-modal-body').html(description);
        $('#confirmation-modal-yes').off('click').on('click', () => {
            if (onConfirm) onConfirm()
        });

        $('#message-modal-show-btn').trigger('click');
    }

}