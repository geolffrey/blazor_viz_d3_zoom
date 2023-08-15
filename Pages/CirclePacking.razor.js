import { CirclePack } from '../js/CirclePack.js'

let circlePacking = {};
let callerObjectRef = {};

export function browserDimmensions() {
    return { width: window.innerWidth, height: window.innerHeight };
}

export function init(objectRef) {
    callerObjectRef = objectRef;

    import('../lib/d3.v7.min.js').then((/*d3*/) => {
        circlePacking = new CirclePack();
        circlePacking.width = window.innerWidth;
        circlePacking.height = window.innerHeight;
        circlePacking.setCallBack = (element) => {
            callerObjectRef.invokeMethodAsync('OnSelectedPoint', element);
        };
        
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
export function addDataSet(ds) {
    circlePacking.addDataSet(ds)
}
export function dispose() {
    circlePacking.dispose();
    circlePacking = null;
}