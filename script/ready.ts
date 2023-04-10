export function ready(cb: () => void) {
    if (document.readyState === "complete") {
        cb();
    } else {
        document.addEventListener("DOMContentLoaded", cb);
    }
}