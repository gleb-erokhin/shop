function mobileNav() {
	// Mobile nav button
	document.querySelector('.menu-icon-wrapper').onclick = function () {
		document.querySelector('.menu-icon').classList.toggle('menu-icon-active');
		document.querySelector('.mobile-nav').classList.toggle('mobile-nav--visible');
	}
}

export default mobileNav;