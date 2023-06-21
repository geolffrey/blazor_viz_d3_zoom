import { CirclePack } from '../js/CirclePack.js'

let circlePacking = {};
export function init() {
    import('../lib/d3.v7.min.js').then(() => {
        circlePacking = new CirclePack();
        circlePacking.init();
    });
};

export function onclickZoomIn() {
    circlePacking.zoomIn();
};

export function onclickZoomOut() {
    circlePacking.zoomOut();
};

export function onclickzoomRandom() {
    circlePacking.zoomRandom();
};

export function onclickzoomReset() {
    circlePacking.zoomReset();
}
export function addDataSet(q) {
    circlePacking.dataSet = q;
}
export function dispose() {
    circlePacking.dispose();
    circlePacking = null;
}