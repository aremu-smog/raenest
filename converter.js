const handleCurrencyConversion = () => {
	const currencyConverters = document.querySelectorAll(".currency-converter")

	currencyConverters.forEach(currencyConverter => {
		const TRANSFER_OPTIONS_TYPE = {
			DROPDOWN: "dropdown",
			TAB: "tab",
		}
		const transferStyleType =
			currencyConverter.getAttribute("transfer-type-style") ??
			TRANSFER_OPTIONS_TYPE.DROPDOWN

		const isTransferOptionsDropdown =
			transferStyleType === TRANSFER_OPTIONS_TYPE.DROPDOWN

		const transferOptionType = transferStyleType

		const API_ENDPOINT =
			"https://byhon4v4qh.execute-api.eu-west-2.amazonaws.com/pro-d/rates?api_key=EcfBmu2FXCDiZNbjRFr_c20n$06869527s&include_fee=true"

		const fromCurrencySelect = currencyConverter.querySelector(
			"#from-currency-select"
		)
		const fromCurrencyOptions = currencyConverter.querySelector(
			"#from-currency-options"
		)
		const fromCurrencyOptionsList = currencyConverter.querySelector(
			"#from-currency-options .w-dropdown-list"
		)
		const fromCurrencyText = currencyConverter.querySelector(
			"#from-currency-text"
		)
		const fromCurrencyFlag = currencyConverter.querySelector(
			"#from-currency-select .currency_flag"
		)
		const fromCurrencySymbol = currencyConverter.querySelector(
			"#from-currency-symbol"
		)
		const fromAmount = currencyConverter.querySelector("#from-amount")

		const toCurrencyOptions = currencyConverter.querySelector(
			"#to-currency-options"
		)
		const toCurrencyOptionsList = currencyConverter.querySelector(
			"#to-currency-options .w-dropdown-list"
		)
		const toCurrencySelect = currencyConverter.querySelector(
			"#to-currency-select"
		)
		const toCurrencyText = currencyConverter.querySelector("#to-currency-text")
		const toCurrencyFlag = currencyConverter.querySelector(
			"#to-currency-select .currency_flag"
		)
		const toCurrencySymbol = currencyConverter.querySelector(
			"#to-currency-symbol"
		)
		const toAmount = currencyConverter.querySelector("#to-amount")

		const convertButton = currencyConverter.querySelector("#convert-button")

		const exchangeRateTo = currencyConverter.querySelector("#exchange-rate-to")
		const exchangeRateFrom = currencyConverter.querySelector(
			"#exchange-rate-from"
		)

		const currencyDropdownToggles = currencyConverter.querySelectorAll(
			".currency_dropdown-toggle"
		)
		const transferOptionsClose = currencyConverter.querySelector(
			"#transfer-options-close"
		)

		const deliveryDurationText =
			currencyConverter.querySelector("#delivery-duration")
		const transactionFeeText =
			currencyConverter.querySelector("#transaction-fee")

		const optionsModal = currencyConverter.querySelector(".modal")

		const transferOptionsWrapper = currencyConverter.querySelector(
			".convert_modal_options_wrap"
		)
		const transactionTypeList = currencyConverter.querySelector(
			"#transaction-type-list"
		)
		const transactionTypeDropdown = currencyConverter.querySelector(
			"#transaction-type_dropdown"
		)
		const selectedTransferType = currencyConverter.querySelector(
			"#selected-transfer-type"
		)

		/**
		 * Values to be updated
		 */
		let exchangeRate = {}
		let deliveryDuration = {}
		let transactionFee = {}
		let transferType = ""
		let FROM_CURRENCY = ""
		let TO_CURRENCY = ""

		const fetchData = async () => {
			convertButton.setAttribute("type", "button")
			try {
				await fetch(API_ENDPOINT)
					.then(res => res.json())
					.then(data => {
						deliveryDuration = data.delivery_duration
						transactionFee = data.fee

						// populate the dropdown options;
						populateDropdownOptions(data.rates)
					})
			} catch (error) {
				console.error("Error fetching data:", error)
			}
		}
		fetchData()

		const updateDeliveryDuration = duration => {
			if (deliveryDurationText) {
				deliveryDurationText.innerHTML = duration
			}
		}
		const handleInput =
			e =>
			(target, isInverse = false) => {
				const numberRegex = /^\d+(\.\d+)?$/
				let inputWithoutComma = e.target.value.replaceAll(",", "")
				const lengthOfInput = inputWithoutComma.length
				const lastCharacter = inputWithoutComma[lengthOfInput - 1]
				const endsWithDecmial = inputWithoutComma[lengthOfInput - 1] === "."

				if (!numberRegex.test(lastCharacter) && !endsWithDecmial) {
					inputWithoutComma = inputWithoutComma.substr(0, lengthOfInput - 1)
				}
				const inputNumber = Number(inputWithoutComma)
				const targetValue = isInverse
					? inputNumber / exchangeRate
					: inputNumber * exchangeRate
				target.value = targetValue.toLocaleString()
				if (inputNumber) {
					e.target.value =
						inputNumber.toLocaleString() + (endsWithDecmial ? "." : "")
				} else {
					target.value = ""
				}

				updateTransactionFee()
			}
		fromAmount.addEventListener("keyup", e => handleInput(e)(toAmount, false))

		toAmount.addEventListener("keyup", e => handleInput(e)(fromAmount, true))

		const populateDropdownOptions = (data = {}) => {
			// African countries are the key of the object from the rates API
			const africanCountries = Object.keys(data)

			// All African countries have the same international countries so we pick just the first one
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

			FROM_CURRENCY = firstInternationalCountry
			TO_CURRENCY = firstAfricanCountry
			exchangeRate = data[firstAfricanCountry][firstInternationalCountry].buy
			handleLoadDefault({ firstAfricanCountry, firstInternationalCountry })

			handleCurrencySelection(data)
		}

		const DEFAULT_FROM_AMOUNT = 1000
		const handleLoadDefault = ({
			firstAfricanCountry,
			firstInternationalCountry,
		}) => {
			toCurrencyText.innerHTML = firstAfricanCountry
			toCurrencyFlag.innerHTML = `<img src="${currencyData[firstAfricanCountry].flagUrl}" />`
			fromCurrencyText.innerHTML = firstInternationalCountry
			fromCurrencyFlag.innerHTML = `<img src="${currencyData[firstInternationalCountry].flagUrl}" />`

			exchangeRateFrom.innerHTML = `${currencyData[firstInternationalCountry].symbol}1`
			exchangeRateTo.innerHTML = `${
				currencyData[firstAfricanCountry].symbol
			}${exchangeRate.toLocaleString()}`

			fromCurrencySymbol.innerHTML =
				currencyData[firstInternationalCountry].symbol
			toCurrencySymbol.innerHTML = currencyData[firstAfricanCountry].symbol

			updateDeliveryDuration(deliveryDuration[firstAfricanCountry])

			const transactionFeeObject = transactionFee[firstAfricanCountry]

			fromAmount.value = DEFAULT_FROM_AMOUNT
			toAmount.value = (DEFAULT_FROM_AMOUNT * exchangeRate).toLocaleString()
			transferType = Object.keys(transactionFeeObject)[0]
			populateTransferOptions(transactionFeeObject)
			updateTransactionFee()
		}

		const setFlag = currency => {
			return `<img src="${currencyData[currency].flagUrl}" />`
		}

		const handleCurrencySelection = (data = {}) => {
			const currencyOptions =
				currencyConverter.querySelectorAll(".currency-option")

			currencyOptions.forEach(currencyOption => {
				currencyOption.addEventListener("click", () => {
					const currency = currencyOption.getAttribute("data-currency")
					const currencyType = currencyOption.getAttribute("data-currency-type")

					const toCurrency = toCurrencyText.textContent.trim()
					const fromCurrency = fromCurrencyText.textContent.trim()

					const isAfrican = currencyType == CURRENCY_TYPE.AFRICAN
					const _fromCurrencySymbol =
						currencyData[isAfrican ? fromCurrency : currency].symbol
					const _toCurrencySymbol =
						currencyData[isAfrican ? currency : toCurrency].symbol

					fromCurrencySymbol.innerHTML = _fromCurrencySymbol
					toCurrencySymbol.innerHTML = _toCurrencySymbol
					if (isAfrican) {
						toCurrencyText.innerHTML = currency
						toCurrencyFlag.innerHTML = setFlag(currency)
						exchangeRate = data[currency][fromCurrency].buy

						exchangeRateFrom.innerHTML = `${currencyData[fromCurrency].symbol}1`
						exchangeRateTo.innerHTML = `${
							currencyData[currency].symbol
						}${exchangeRate.toLocaleString()}`

						const fromAmountValue =
							Number(toAmount.value.replaceAll(",", "")) / exchangeRate
						fromAmount.value = Number(
							fromAmountValue.toFixed(2)
						).toLocaleString()
						updateDeliveryDuration(deliveryDuration[currency])
						TO_CURRENCY = currency
						const transactionFeeObject = transactionFee[currency]
						populateTransferOptions(transactionFeeObject)
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

						FROM_CURRENCY = currency
					}

					updateTransactionFee()
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
			currencyDropdownToggles.forEach(currencyDropdownToggle => {
				const dropdownToggleClassList =
					currencyDropdownToggle.classList.value ?? ""
				const isOpen = dropdownToggleClassList.includes("w--open")
				if (isOpen) {
					currencyDropdownToggle.click()
				}
			})
		}

		const CURRENCY_TYPE = {
			AFRICAN: "african",
			INTERNATIONAL: "international",
		}

		const TRANSFER_OPTIONS = {
			local_bank: {
				label: "Bank Account Transfers",
				description: `Supports: ACH, FAST, SEPA, SWIFT,
and local bank transfers.`,
				value: "local_bank",
			},
			mobile_money: {
				label: "Mobile Money Transfers",
				description: `Send mobile money to various countries
via mobile money transfers.`,
				value: "mobile_money",
			},
			internal: {
				label: "Raenest to Raenest Transfers",
				description: `Enjoy instant, zero-fee transfers
between Raenest accounts.`,
				value: "internal",
			},
		}

		const populateTransferOptions = options => {
			const availableOptions = Object.keys(options)
			const transferOptionsList = [...availableOptions, "internal"]
				.map(option => {
					return TRANSFER_OPTION_TEMPLATES[transferOptionType](
						TRANSFER_OPTIONS[option]
					)
				})
				.join("")
			transactionTypeList.innerHTML = transferOptionsList

			const transferOptionsCta = currencyConverter.querySelectorAll(
				isTransferOptionsDropdown
					? ".currency_transfer-type"
					: ".currency_transfer_full-link"
			)

			transferOptionsCta.forEach(option => {
				option.addEventListener("click", () => {
					const value = option.getAttribute("data-value")
					transferType = value
					selectTransferOption(transferType, true)
				})
			})
		}

		const selectTransferOption = (value, shouldToggle = false) => {
			const selectedTransferOption = currencyConverter.querySelector(
				`[data-value='${value}']`
			)
			const transferOptionsCta = currencyConverter.querySelectorAll(
				isTransferOptionsDropdown
					? ".currency_transfer-type"
					: ".currency_transfer_full-link"
			)
			transferOptionsCta.forEach(option => {
				option.classList.remove("is-active")
			})
			selectedTransferOption.classList.add("is-active")
			if (isTransferOptionsDropdown) {
				selectedTransferType.innerHTML = TRANSFER_OPTIONS[value].label
				if (shouldToggle) {
					transactionTypeDropdown.click()
				}
			}
		}

		const updateTransactionFee = () => {
			const isInternalTransfer = transferType === "internal"

			const availableTransferOptions = Object.keys(transactionFee[TO_CURRENCY])
			const isTransferOptionAvailableForCurrency =
				availableTransferOptions.indexOf(transferType) > -1
			const firstTransferOption = availableTransferOptions[0]
			const _transferType = isTransferOptionAvailableForCurrency
				? transferType
				: firstTransferOption

			const _transactionFee = isInternalTransfer
				? { min: 0, percent: 0, cap: 0 }
				: transactionFee[TO_CURRENCY][_transferType]

			const { min, percent, cap } = _transactionFee
			const _toAmount = Number(toAmount.value.replaceAll(",", ""))
			const feesInPercentage = (percent / 100) * _toAmount
			const actualTransactionFee = Math.min(
				Math.max(min, feesInPercentage),
				cap
			).toFixed(2)

			transactionFeeText.innerHTML = `${toCurrencySymbol.innerHTML}${actualTransactionFee}`
			selectTransferOption(_transferType)
		}

		convertButton.addEventListener("click", () => {
			window.open("https://raenest.com", "_blank")
		})
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

		const TRANSFER_OPTION_TEMPLATES = {
			[TRANSFER_OPTIONS_TYPE.DROPDOWN]: ({ label, value, description }) => {
				return `<button type="button" data-value="${value}" class="currency_transfer-type">
                                  <div class="convert_modal_option-text_wrap">
                                    <div class="convert_modal_option-heading">${label}</div>
                                    <div class="convert_modal_option-text">${description}</div>
                                  </div>
                                </button>`
			},
			[TRANSFER_OPTIONS_TYPE.TAB]: ({ label, value }) => {
				return `<button data-value="${value}" type="button" class="currency_transfer_full-link">${label}</button>`
			},
		}
	})
}

handleCurrencyConversion()
