
export class ConfirmationScreen {

    constructor(title: string, description: string, onConfirm: () => void, optionYes?: string, optionNo?: string) {
        const optYes = optionYes ?? "Yes";
        const optNo = optionNo ?? "No";

        $('#confirmation-modal-title').html(title);
        $('#confirmation-modal-body').html(description);
        $('#confirmation-modal-no').html(optNo);
        $('#confirmation-modal-yes').html(optYes).off('click').on('click', () => onConfirm());

        $('#confirmation-modal-show-btn').trigger('click');
    }

}