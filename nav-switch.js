const dynamicPages = ["currency-converter", "blog"]
const currentPage = window.location.href
const referPage = document.referrer

const isDynamicPage =
	dynamicPages.find(page => currentPage.includes(page)) && referPage

const isBusinessPage = () => {
	const pageCompare = isDynamicPage ? referPage : currentPage
	const isFromBusiness = JSON.parse(
		window.localStorage.getItem("referrerByBusiness")
	)
	if (isDynamicPage) {
		return isFromBusiness || pageCompare.includes("business")
	} else {
		window.localStorage.removeItem("referrerByBusiness")
		return pageCompare.includes("business")
	}
}

const handleDynamicPageNavigationForBusiness = () => {
	if (isDynamicPage) {
		window.localStorage.setItem("referrerByBusiness", JSON.stringify(true))
	}
}

const handleDynamicNavigation = () => {
	const navToggles = document.querySelectorAll(".nav__category-link")
	navToggles.forEach(toggle => {
		const toggleValue = toggle.getAttribute("data-value")
		if (isBusinessPage() && toggleValue === "business") {
			toggle.classList.add("nav__category-link-active")
			handleDynamicPageNavigationForBusiness()
		} else if (!isBusinessPage() && toggleValue === "personal") {
			toggle.classList.add("nav__category-link-active")
		}
	})
}

const hideAppDownloads = () => {
	const appDownloads = document.querySelectorAll(
		".nav_1_dropdown_download-apps"
	)
	appDownloads.forEach(appDownload => {
		appDownload.style.display = "none"
	})
}
const handleSubmenu = () => {
	const subMenus = document.querySelectorAll(".submenu")
	subMenus.forEach(subMenu => {
		const subMenuValue = subMenu.getAttribute("data-value")
		subMenu.style.display = "none"
		if (isBusinessPage() && subMenuValue === "business") {
			subMenu.style.display = "block"
			hideAppDownloads()
		} else if (!isBusinessPage() && subMenuValue === "personal") {
			subMenu.style.display = "block"
		}
	})
}

handleDynamicNavigation()
handleSubmenu()
