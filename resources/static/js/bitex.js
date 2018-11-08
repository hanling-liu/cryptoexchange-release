// bitex exchange

// restruct spot accounts from api to account array,
// and each element has 'currency', 'available', 'frozen':
// function restructSpotAccounts(accountArray) {
// 	var accounts = _.map(window.CURRENCIES, function (cur) {
// 		return {
// 			currency: cur.name,
// 			available: 0,
// 			frozen: 0,
// 			locked:0
// 		};
// 	});
// 	_.each(accountArray, function (acc) {
// 		var account = _.find(accounts, function (a) {
// 			return a.currency === acc.currency;
// 		});
// 		if (acc.type === 'SPOT_AVAILABLE') {
// 			account.available = acc.balance;
// 		}else if (acc.type === 'SPOT_FROZEN') {
// 			account.frozen = acc.balance;
// 		}else if(acc.type === 'SPOT_LOCKED'){
// 			account.locked = acc.balance;
// 		}
// 	});
// 	console.log('accounts: ' + JSON.stringify(accounts));
// 	return accounts;
// }

function reload() {
	var url = location.pathname;
	if (location.search) {
		url = url + location.search + '&t=' + new Date().getTime();
	} else {
		url = url + '?t=' + new Date().getTime();
	}
	location.assign(url);
}

function showError(formSelector, err) {
	if (arguments.length === 1) {
		err = formSelector;
		formSelector = undefined;
	}
	if (err) {
		// show error:
		if (formSelector && err.data) {
			var name = err.data;
			$(formSelector + ' input[name=' + name + ']').addClass('uk-form-danger');
			$(formSelector + ' select[name=' + name + ']').addClass('uk-form-danger');
		}
		var alert = $(formSelector ? formSelector + ' .uk-alert-danger' : '.uk-alert-danger');
		if (alert.get().length > 0) {
			alert.text(err.message || err.error || err || 'Network error');
			alert.removeClass('uk-hidden').show();
		} else {
			UIkit2.notify(err.message || err.error || err || 'Network error', { status: 'danger'});
		}
	} else {
		// clear error:
		if (formSelector) {
			$(formSelector + ' input').addClass('uk-form-danger');
			$(formSelector + ' input').addClass('uk-form-danger');
		}
		var alert = $(formSelector ? formSelector + ' .uk-alert-danger' : '.uk-alert-danger');
		if (alert.get().length > 0) {
			alert.text('');
			alert.hide();
		}
	}
}

function getJSON(url, data, callback) {
	if (arguments.length === 2 && typeof data=='function') {
		callback = data;
		data = {};
	}
	return $.ajax({
		type: 'GET',
		dataType: 'json',
		url: url,
		data: data
	}).done(function (resp) {
		callback && callback(null, resp);
	}).fail(function (jq) {
		var err = {
			error: 'NETWORK_ERROR',
			message: 'Network error.'
		}
		try {
			err = JSON.parse(jq.responseJSON);
		} catch (e) {
		}
		callback&& callback(err);
	});
}

function postJSON(url, data, callback) {
	if (arguments.length === 2) {
		callback = data;
		data = {};
	}
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		dataType: 'json',
		url: url,
		data: JSON.stringify(data)
	}).done(function (resp) {
		callback(null, resp);
	}).fail(function (jq) {
		var err = {
			error: 'NETWORK_ERROR',
			message: 'Network error.'
		}
		try {
			err = jq.responseJSON;
		} catch (e) {
		}
		callback(err);
	});
}

function getParam(name, defaultValue) {
	url = location.href;
	var regexS = '[\\?&]' + name + '=([^&#]*)';
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	return results === null ? defaultValue : decodeURIComponent(results[1]);
}

function togglePanel(x) {
	var
		panel = $(x).parentsUntil('.uk-panel').parent(),
		icon = panel.find('.uk-panel-title').find('i:first'),
		body = panel.find('.uk-panel-body');
	if (body.is(':visible')) {
		icon.removeClass('uk-icon-angle-down');
		icon.addClass('uk-icon-angle-up');
		body.slideUp();
	} else {
		icon.removeClass('uk-icon-angle-up');
		icon.addClass('uk-icon-angle-down');
		body.slideDown();
	}
}

// prototype //////////////////////////////////////////////////////////////////

Number.prototype.toTime = function () {
	if (isNaN(this)) {
		return '-';
	}
	var
		d = new Date(this),
		h = d.getHours(),
		m = d.getMinutes(),
		s = d.getSeconds();
	return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
};

Number.prototype.toDateTime = function () {
	if (isNaN(this)) {
		return '-';
	}
	var
		d = new Date(this),
		yy = d.getFullYear(),
		mm = d.getMonth() + 1,
		dd = d.getDate(),
		h = d.getHours(),
		m = d.getMinutes(),
		s = d.getSeconds();
	return yy + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd + ' ' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

Number.prototype.toChange = function () {
	if (isNaN(this)) {
		return '-';
	}
	return (this * 100).toFixed(2) + '%';
}

Number.prototype.toPrice = function (scale) {
	if (isNaN(this)) {
		return '-';
	}
	if (scale === undefined) {
		if (window.CURRENT_SYMBOL) {
			scale = window.CURRENT_SYMBOL.quoteScale;
		} else {
			scale = 2;
		}
	}
	return this.toFixed(scale);
}

Number.prototype.toAmount = function (scale) {
	if (isNaN(this)) {
		return '-';
	}
	if (scale === undefined) {
		if (window.CURRENT_SYMBOL) {
			scale = window.CURRENT_SYMBOL.baseScale;
		} else {
			scale = 2;
		}
	}
	return this.toFixed(scale);
}

String.prototype.toSymbol = function () {
	return this.replace('_', '/');
}
