function $(ele) {
  return document.querySelector(ele);
}
function toggleComponent() {
  let ele = $("#plp-components-box");
  let plpBtn = $(".plp-btn");
  let closeBtn = $(".close-btn");
  if (ele.hasClass("active")) {
    ele.removeClass("active");
    plpBtn.show();
    closeBtn.hide();
  } else {
    ele.addClass("active");
    plpBtn.hide();
    let timer = setTimeout(() => {
      closeBtn.show();
      clearTimeout(timer);
    }, 500);
  }
  return false;
}

function toggleLabelClick(event){
  var target = event.target
  if(target.nodeName == "LABEL"){
    if (target.className.indexOf("checked") !== -1) {
      target.className = target.className.replace("checked", "");
      } else {
      target.className += " checked";
      }
  }
}