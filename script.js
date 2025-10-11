// 監聽滾動事件
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const windowHeight = window.innerHeight;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.8) {
            section.classList.add('visible');
        }
    });
});

// 頁面載入時，觸發一次滾動事件，確保初始顯示
window.dispatchEvent(new Event('scroll'));

// 更新麵包屑文字
document.addEventListener("DOMContentLoaded", () => {
  const breadcrumb = document.querySelector("#breadcrumb span");
  const page = window.location.pathname.split("/").pop();

  switch (page) {
    case "about.html":
      breadcrumb.textContent = "About";
      break;
    case "skills.html":
      breadcrumb.textContent = "Skills";
      break;
    case "portfolio.html":
      breadcrumb.textContent = "Portfolio";
      break;
    default:
      breadcrumb.textContent = "Home";
  }
});

