setInterval(() => {
  const dots = document.getElementById("loader");
  const seq = ["-", "\\", "|", "/"];
  const current_index = seq.findIndex(el => el == dots.innerHTML);
  dots.innerHTML = seq[(current_index == seq.length - 1) ? 0 : current_index + 1];
}, 2e2)
