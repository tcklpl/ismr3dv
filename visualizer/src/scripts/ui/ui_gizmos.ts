import { Gizmo } from "../engine/data_formats/gizmos/gizmo";
import { Vec3 } from "../engine/data_formats/vec/vec3";
import { RandomUtils } from "../visualizer/utils/random_utils";
import { CreateMagneticLineGizmoModal } from "./create_magnetic_gizmo_modal";
import { IUI } from "./i_ui";

export class UIGizmos implements IUI {

    private _fixedGizmosContainer = $('#accordion-gizmos');
    private _magneticGizmosContainer = $('#accordion-gizmos-magnetic');
    private _magneticTitle = $('#accordion-gizmos-magnetic-title');
    private _addMagGizmoBtn = $('#add-magnetic-gizmo-btn');

    registerEvents(): void {
        
        visualizer.gizmoManager.fixedGizmos.forEach(g => {
            this.createAndAppendGizmoCard(g, this._fixedGizmosContainer);
        });

        visualizer.events.on('magnetic-gizmos-att', () => {
            this._magneticGizmosContainer.empty();
            visualizer.gizmoManager.magneticGizmos.forEach(g => {
                this.createAndAppendGizmoCard(g, this._magneticGizmosContainer, true);
            });
        });

        visualizer.events.on('session-is-present', (sessionStatus: boolean, ...rest) => {
            this._magneticGizmosContainer.toggleClass('d-block', sessionStatus).toggleClass('d-none', !sessionStatus);
            this._magneticTitle.toggleClass('d-flex', sessionStatus).toggleClass('d-none', !sessionStatus);
        });

        this._addMagGizmoBtn.on('click', () => new CreateMagneticLineGizmoModal());
        
    }

    private createAndAppendGizmoCard(g: Gizmo, appendTo: JQuery<HTMLElement>, magnetic = false) {
        let str = '<div class="accordion-item">';
        const headerId = `gzh-${RandomUtils.randomString(10)}`;
        const collapseId = `gzc-${RandomUtils.randomString(10)}`;
        const enableId = `gzb-${RandomUtils.randomString(10)}`;
        const bloomId = `gzb-${RandomUtils.randomString(10)}`;
        const colorId = `gzb-${RandomUtils.randomString(10)}`;
        const deleteButtonId = `gzd-${RandomUtils.randomString(10)}`;

        str += `<h2 class="accordion-header" id="${headerId}">`;
        str += `<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="true" aria-controls="${collapseId}">`;
        str += `<img src="${g.icon}" class="icon-left" style="width: 2.8em;">`;
        str += g.name;
        str += '</button></h2>';
        str += `<div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}" data-bs-parent="#accordion-gizmos">`;
        str += '<div class="accordion-body">';

        // enabled
        str += '<div class="row" style="margin-bottom: 0.2em;">';
        str += '<div class="col-6 d-flex align-items-center">Enabled</div>';
        str += `<div class="col-6"><label class="switch float-end"><input type="checkbox" id="${enableId}" ${magnetic ? 'checked' : ''}><span class="slider round"></span></label></div>`;
        str += '</div>';

        // bloom
        str += '<div class="row" style="margin-bottom: 0.2em;">';
        str += '<div class="col-6 d-flex align-items-center">Glow</div>';
        str += `<div class="col-6"><label class="switch float-end"><input type="checkbox" id="${bloomId}"><span class="slider round"></span></label></div>`;
        str += '</div>';

        // color
        str += '<div class="row" style="margin-bottom: 0.2em;">';
        str += '<div class="col-6 d-flex align-items-center">Color</div>';
        str += `<div class="col-6"><input type="color" class="float-end" id="${colorId}" style="width: 60px;" value="#ffffff"></div>`;
        str += '</div>';

        if (magnetic) {
            str += '<div class="row" style="margin-bottom: 0.2em;">';
            str += '<div class="col-6 d-flex align-items-center">Actions</div>';
            str += `<div class="col-6 d-flex justify-content-end"><button id="${deleteButtonId}" class="btn btn-danger"><i class="bi-trash"></i></button></div>`;
            str += '</div>';
        }

        str += '</div></div></div>';

        const parsed = $.parseHTML(str);
        appendTo.append(parsed);

        $(`#${enableId}`).on('change', () => {
            g.enabled = $(`#${enableId}`).prop('checked');
        });

        $(`#${bloomId}`).on('change', () => {
            g.bloom = $(`#${bloomId}`).prop('checked');
        });

        $(`#${colorId}`).on('change', () => {
            const val = ($(`#${colorId}`).val() as string).replace('#', '');
            const cr = parseInt(val.substring(0, 2), 16) / 255;
            const cg = parseInt(val.substring(2, 4), 16) / 255;
            const cb = parseInt(val.substring(4, 6), 16) / 255;
            g.color = new Vec3(cr, cg, cb);
        });

        if (magnetic) {
            $(`#${deleteButtonId}`).on('click', () => {
                visualizer.gizmoManager.deleteMagneticGizmo(g);
            });
        }
    }
}