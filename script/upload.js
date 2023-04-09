import {test} from './test';

document.addEventListener("DOMContentLoaded", test);
if (document.readyState === "complete") {
    test();
}