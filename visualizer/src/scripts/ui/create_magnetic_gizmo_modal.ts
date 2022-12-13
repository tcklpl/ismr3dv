import { MessageScreen } from "./message_screen";

export class CreateMagneticLineGizmoModal {

    constructor() {
        $('#new-magnetic-line-degrees').val(0);
        $('#new-magnetic-line-modal-yes').off('click').on('click', () => {
            let degrees = Number($('#new-magnetic-line-degrees').val());
            if (Number.isNaN(degrees)) {
                console.warn('Failed to parse degrees to create magnetic line gizmo');
                return;
            }
            if (degrees < -90 || degrees > 90) {
                console.warn('Degree out of bounds');
                return;
            }
            if (!visualizer.gizmoManager.createMagneticFieldGizmo(degrees)) new MessageScreen('Error', 'Failed to create Gizmo');
        });

        $('#new-magnetic-line-modal-show-btn').trigger('click');
    }

}