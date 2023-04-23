const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

if (Mouse != null) {
  window.mouse = new Mouse(canvas);
}

window.onresize = (evt) => {
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
  if (window.resizeCallback != null) {
    window.resizeCallback(evt);
  }
};
window.onresize();

document.getElementById("download-btn").onclick = function () {
  const url = canvas.toDataURL();
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${
    document.getElementsByTagName("title")?.[0].innerText ?? "download"
  }.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};
