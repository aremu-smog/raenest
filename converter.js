console.loog("Converter script loaded")

const API_ENDPOINT =
	"https://ha6leouolrtc3byh6hxlsoyqsm0wxyhm.lambda-url.eu-west-2.on.aws/?api_key=EcfBmu2FXCDiZNbjRFr_c20n$06869527s"

const fromCurrencySelect = document.querySelector("#from-currency-select")
const fromCurrencyOptions = document.querySelector("#from-currency-options")
const fromCurrencyOptionsList = document.querySelector(
	"#from-currency-options .w-dropdown-list"
)
const fromCurrencyText = document.querySelector("#from-currency-text")
const fromCurrencyFlag = document.querySelector(
	"#from-currency-select .currency_flag"
)
const fromAmount = document.querySelector("#from-amount")

const toCurrencyOptions = document.querySelector("#to-currency-options")
const toCurrencyOptionsList = document.querySelector(
	"#to-currency-options .w-dropdown-list"
)
const toCurrencySelect = document.querySelector("#to-currency-select")
const toCurrencyText = document.querySelector("#to-currency-text")
const toCurrencyFlag = document.querySelector(
	"#to-currency-select .currency_flag"
)
const toAmount = document.querySelector("#to-amount")

const convertButton = document.querySelector("#convert-button")

const exchangeRateTo = document.querySelector("#exchange-rate-to")
const exchangeRateFrom = document.querySelector("#exchange-rate-from")

const currencyDropdownLists = document.querySelectorAll(
	".currency_dropdown_list"
)

let exchangeRate
;(async () => {
	convertButton.setAttribute("disabled", "disabled")
	try {
		await fetch(API_ENDPOINT)
			.then(res => res.json())
			.then(data => {
				// populate the dropdown options;
				populateDropdownOptions(data)
			})
	} catch {
		// use mock data to populate dropdown options temporarily till with sort API endpoint
		populateDropdownOptions(MOCK_DATA)
	}
})()

fromAmount.addEventListener("keyup", e => {
	const numberRegex = /^\d+(\.\d+)?$/
	let inputWithoutComma = e.target.value.replaceAll(",", "")
	const lengthOfInput = inputWithoutComma.length
	const lastCharacter = inputWithoutComma[lengthOfInput - 1]
	const endsWithDecmial = inputWithoutComma[lengthOfInput - 1] === "."

	if (!numberRegex.test(lastCharacter) && !endsWithDecmial) {
		inputWithoutComma = inputWithoutComma.substr(0, lengthOfInput - 1)
	}
	const inputNumber = Number(inputWithoutComma)
	const toAmountValue = inputNumber * exchangeRate
	toAmount.value = toAmountValue.toLocaleString()
	if (inputNumber) {
		fromAmount.value =
			inputNumber.toLocaleString() + (endsWithDecmial ? "." : "")
	} else {
		toAmount.value = ""
	}
})
toAmount.addEventListener("keyup", e => {
	const inputValue = Number(e.target.value.replaceAll(",", ""))
	const fromAmountValue = inputValue / exchangeRate

	fromAmount.value = Number(fromAmountValue.toFixed(2)).toLocaleString()
	toAmount.value = inputValue.toLocaleString()
})

const populateDropdownOptions = (data = {}) => {
	const africanCountries = Object.keys(data)
	const internationalCountries = Object.keys(data[africanCountries[0]])

	const africaCountryOptions = africanCountries
		.map(africanCountry => {
			return optionTemplate({
				currencyText: africanCountry,
				type: CURRENCY_TYPE.AFRICAN,
			})
		})
		.join("")
	const internationalCountryOptions = internationalCountries
		.map(internationalCountry => {
			return optionTemplate({
				currencyText: internationalCountry,
				type: CURRENCY_TYPE.INTERNATIONAL,
			})
		})
		.join("")

	fromCurrencyOptions.innerHTML = africaCountryOptions
	toCurrencyOptions.innerHTML = internationalCountryOptions

	const firstAfricanCountry = africanCountries[0]
	const firstInternationalCountry = internationalCountries[0]

	exchangeRate = data[firstAfricanCountry][firstInternationalCountry].sell
	handleLoadDefault({ firstAfricanCountry, firstInternationalCountry })

	handleCurrencySelection(data)
}

const handleLoadDefault = ({
	firstAfricanCountry,
	firstInternationalCountry,
}) => {
	toCurrencyText.innerHTML = firstAfricanCountry
	toCurrencyFlag.innerHTML = `<img src="${currencyData[firstAfricanCountry].flagUrl}" />`
	fromCurrencyText.innerHTML = firstInternationalCountry
	fromCurrencyFlag.innerHTML = `<img src="${currencyData[firstInternationalCountry].flagUrl}" />`

	exchangeRateFrom.innerHTML = `${currencyData[firstAfricanCountry].symbol}1`
	exchangeRateTo.innerHTML = `${
		currencyData[firstInternationalCountry].symbol
	}${exchangeRate.toLocaleString()}`
}

const setFlag = currency => {
	return `<img src="${currencyData[currency].flagUrl}" />`
}

const handleCurrencySelection = (data = {}) => {
	const currencyOptions = document.querySelectorAll(".currency-option")

	currencyOptions.forEach(currencyOption => {
		currencyOption.addEventListener("click", () => {
			const currency = currencyOption.getAttribute("data-currency")
			const currencyType = currencyOption.getAttribute("data-currency-type")

			const toCurrency = toCurrencyText.textContent.trim()
			const fromCurrency = fromCurrencyText.textContent.trim()

			if (currencyType === CURRENCY_TYPE.AFRICAN) {
				toCurrencyText.innerHTML = currency
				toCurrencyFlag.innerHTML = setFlag(currency)
				exchangeRate = data[currency][fromCurrency].buy

				exchangeRateFrom.innerHTML = `${currencyData[fromCurrency].symbol}1`
				exchangeRateTo.innerHTML = `${
					currencyData[currency].symbol
				}${exchangeRate.toLocaleString()}`

				const fromAmountValue =
					Number(toAmount.value.replaceAll(",", "")) / exchangeRate
				fromAmount.value = Number(fromAmountValue.toFixed(2)).toLocaleString()
			} else {
				fromCurrencyText.innerHTML = currency
				fromCurrencyFlag.innerHTML = setFlag(currency)
				exchangeRate = data[toCurrency][currency].buy

				exchangeRateFrom.innerHTML = `${currencyData[currency].symbol}1`
				exchangeRateTo.innerHTML = `${
					currencyData[toCurrency].symbol
				}${exchangeRate.toLocaleString()}`
				const toAmountValue =
					Number(fromAmount.value.replaceAll(",", "")) * exchangeRate
				toAmount.value = Number(toAmountValue.toFixed(2)).toLocaleString()
			}

			closeCurrencyOptions()
		})
	})
}

const optionTemplate = ({ currencyText, type }) => {
	return `<button type="button" class="currency-option currency_dropdown_link w-inline-block" data-currency-type="${type}" data-currency="${currencyText}" tabindex="0">
                <span class="currency_flag">
                <img src="${currencyData[currencyText].flagUrl}" />
                </span>
                <span class="currency_dropdown-text-wrap">
                <span class="currency_text">${currencyText}</span>
                </span>
            </button>
            `
}

const closeCurrencyOptions = () => {
	currencyDropdownLists.forEach(currencyDropdownList => {
		currencyDropdownList.classList.remove("w--open")
	})
}

const CURRENCY_TYPE = {
	AFRICAN: "african",
	INTERNATIONAL: "international",
}

const MOCK_DATA = {
	GHS: {
		EUR: {
			buy: 16.93,
			sell: 14.68,
		},
		GBP: {
			buy: 20.34,
			sell: 19.6,
		},
		USD: {
			buy: 25.96,
			sell: 15.45,
		},
	},
	KES: {
		EUR: {
			buy: 149,
			sell: 134.5,
		},
		GBP: {
			buy: 165,
			sell: 160.56,
		},
		USD: {
			buy: 145,
			sell: 128.5,
		},
	},
	NGN: {
		EUR: {
			buy: 1763,
			sell: 1727,
		},
		GBP: {
			buy: 2070,
			sell: 2035,
		},
		USD: {
			buy: 1615,
			sell: 1583,
		},
	},
	TZS: {
		EUR: {
			buy: 2832.78,
			sell: 2632.78,
		},
		GBP: {
			buy: 4087.51,
			sell: 3085.51,
		},
		USD: {
			buy: 2756.31,
			sell: 2556.31,
		},
	},
	UGX: {
		EUR: {
			buy: 4081.36,
			sell: 3820.26,
		},
		GBP: {
			buy: 4778.82,
			sell: 4444.82,
		},
		USD: {
			buy: 3720,
			sell: 3630,
		},
	},
}

const currencyData = {
	GHS: {
		symbol: "₵",
		flagUrl:
			"https://cdn.prod.website-files.com/67d85bdb392a92fa03e2f524/67f30b6ca1aa4919ed8d8353_ghana.svg",
	},
	NGN: {
		symbol: "₦",
		flagUrl:
			"https://cdn.prod.website-files.com/67d85bdb392a92fa03e2f524/67f30b6cebce38c643426fbe_Nigeria.svg",
	},
	KES: {
		symbol: "KSh",
		flagUrl:
			"https://cdn.prod.website-files.com/67d85bdb392a92fa03e2f524/67f30b6c8e9c38433d51d072_kenya.svg",
	},
	TZS: {
		symbol: "Sh",
		flagUrl:
			"https://cdn.prod.website-files.com/67d85bdb392a92fa03e2f524/67f30b6c8f1a9e96af346a2f_tanzania.svg",
	},
	UGX: {
		symbol: "USh",
		flagUrl:
			"https://cdn.prod.website-files.com/67d85bdb392a92fa03e2f524/67f30b6c0a5eef242ad3d6c2_uganda.svg",
	},

	EUR: {
		symbol: "€",
		flagUrl:
			"https://cdn.prod.website-files.com/67d85bdb392a92fa03e2f524/67f30b6c059fd2e4dc0beba2_eur.svg",
	},
	GBP: {
		symbol: "£",
		flagUrl:
			"https://cdn.prod.website-files.com/67d85bdb392a92fa03e2f524/67f30b6cbdabb2f83f697d9e_uk.svg",
	},
	USD: {
		symbol: "$",
		flagUrl:
			"https://cdn.prod.website-files.com/67d85bdb392a92fa03e2f524/67f30b6cbba583171c47994d_usa.svg",
	},
}
