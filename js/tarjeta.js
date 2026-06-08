const tarjeta = document.getElementById("tarjeta");
const btnAbrir = document.getElementById("btn-abrir-formulario");
const formulario = document.getElementById("formulario-tarjeta");
const numeroTarjeta = document.querySelector("#tarjeta .numero");
const nombreTarjeta = document.querySelector("#tarjeta .nombre");
const logoMarca = document.getElementById("logo-marca");
const firma = document.querySelector("#tarjeta .firma p");
const mesExpiracion = document.querySelector("#tarjeta .mes");
const yearExpiracion = document.querySelector("#tarjeta .year");
const ccvDisplay = document.querySelector("#tarjeta .ccv");

/* Helpers */
function mostrarFrente() {
	tarjeta?.classList.remove("active");
}

function setLogo(primerDigito) {
	if (!logoMarca) return;
	logoMarca.innerHTML = "";

	const logos = { "4": "img/logos/visa.png", "5": "img/logos/mastercard.png" };
	const src = logos[primerDigito];

	if (src) {
		const img = document.createElement("img");
		img.src = src;
		img.alt = primerDigito === "4" ? "Visa" : "Mastercard";
		logoMarca.appendChild(img);
	}
}

function poblarSelects() {
	const selectMes = document.getElementById("selectMes");
	const selectYear = document.getElementById("selectYear");
	if (!selectMes || !selectYear) return;

	for (let i = 1; i <= 12; i++) {
		const opt = document.createElement("option");
		opt.value = i;
		opt.textContent = String(i).padStart(2, "0");
		selectMes.appendChild(opt);
	}

	const yearActual = new Date().getFullYear();
	for (let i = yearActual; i <= yearActual + 8; i++) {
		const opt = document.createElement("option");
		opt.value = i;
		opt.textContent = i;
		selectYear.appendChild(opt);
	}
}

/* Listeners formulario */
function initFormListeners() {
	const inputNumero = document.getElementById("inputNumero");
	const inputNombre = document.getElementById("inputNombre");
	const selectMes = document.getElementById("selectMes");
	const selectYear = document.getElementById("selectYear");
	const inputCCV = document.getElementById("inputCCV");

	/* Número */
	inputNumero?.addEventListener("input", (e) => {
		let val = e.target.value.replace(/\D/g, "").slice(0, 16);
		e.target.value = val.replace(/(.{4})/g, "$1 ").trim();

		numeroTarjeta.textContent = e.target.value || "#### #### #### ####";
		setLogo(val[0] ?? "");
		mostrarFrente();
	});

	/* Nombre */
	inputNombre?.addEventListener("input", (e) => {
		const val = e.target.value.replace(/[0-9]/g, "");
		e.target.value = val;
		nombreTarjeta.textContent = val || "HIGH FLIGHT";
		if (firma) firma.textContent = val;
		mostrarFrente();
	});

	/* Mes */
	selectMes?.addEventListener("change", (e) => {
		mesExpiracion.textContent = String(e.target.value).padStart(2, "0");
		mostrarFrente();
	});

	/* Año */
	selectYear?.addEventListener("change", (e) => {
		yearExpiracion.textContent = String(e.target.value).slice(2);
		mostrarFrente();
	});

	/* CCV — voltear tarjeta */
	inputCCV?.addEventListener("input", (e) => {
		e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
		if (ccvDisplay) ccvDisplay.textContent = e.target.value;
		/* Mostrar trasera mientras escribe el CCV */
		if (!tarjeta?.classList.contains("active")) {
			tarjeta?.classList.add("active");
		}
	});
}

/* Toggle de la tarjeta*/
function initCardToggle() {
	tarjeta?.addEventListener("click", () => {
		tarjeta.classList.toggle("active");
	});
}

/* Toggle formulario */
function initFormToggle() {
	btnAbrir?.addEventListener("click", () => {
		const expanded = btnAbrir.getAttribute("aria-expanded") === "true";
		btnAbrir.classList.toggle("active");
		btnAbrir.setAttribute("aria-expanded", !expanded);
		formulario?.classList.toggle("active");
	});
}

/* Envío del formulario */
function initSubmit() {
	formulario?.addEventListener("submit", (e) => {
		e.preventDefault();

		const numero = document.getElementById("inputNumero")?.value.replace(/\s/g, "");
		const nombre = document.getElementById("inputNombre")?.value.trim();
		const mes = document.getElementById("selectMes")?.value;
		const year = document.getElementById("selectYear")?.value;
		const ccv = document.getElementById("inputCCV")?.value;

		/* Validaciones básicas */
		if (!numero || numero.length < 16) {
			window.showNotification("Ingresa un número de tarjeta válido (16 dígitos).", "error");
			return;
		}
		if (!nombre) {
			window.showNotification("Ingresa el nombre del titular.", "error");
			return;
		}
		if (!mes || mes === "Mes") {
			window.showNotification("Selecciona el mes de expiración.", "error");
			return;
		}
		if (!year || year === "Año") {
			window.showNotification("Selecciona el año de expiración.", "error");
			return;
		}
		if (!ccv || ccv.length < 3) {
			window.showNotification("Ingresa el CCV (3 dígitos).", "error");
			return;
		}

		const btn = document.getElementById("btnGuardar");
		if (btn) {
			btn.disabled = true;
			btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Procesando...';
		}

		setTimeout(() => {
			window.showNotification("¡Pago procesado con éxito! Redirigiendo...", "success");
			setTimeout(() => { window.location.href = "index.html"; }, 1800);
		}, 1400);
	});
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", () => {
	poblarSelects();
	initCardToggle();
	initFormToggle();
	initFormListeners();
	initSubmit();
});