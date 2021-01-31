/**
 * @type {[HTMLDivElement]}
 */
let tabHeaders;
/**
 * @type {[HTMLDivElement]}
 */
let tabPanels;


/**
 * 
 * @param {MouseEvent} eventArgs 
 */
function tabClick(eventArgs) {
    console.log('tabClick');
    tabHeaders.forEach(x=>x.classList.remove('active'));
    eventArgs.target.classList.add('active');

    tabPanels.forEach(x=>x.classList.remove('active'));
    console.log(eventArgs.target.innerText)
    tabPanels.find(x=>x.id == eventArgs.target.innerText).classList.add('active');
}


tabHeaders = Array.from(document.querySelectorAll('.tab-control>.tab-list>.tab-header'));
tabPanels = Array.from(document.querySelectorAll('.tab-control>.tab-content'));

tabHeaders.forEach(x=>x.addEventListener('click', tabClick));
