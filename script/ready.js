export function ready(cb) {
    if (document.readyState === "complete") {
        cb();
    } else {
        document.addEventListener("DOMContentLoaded", cb);
    }
}