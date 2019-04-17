import CustomError from '../utils/CustomError';
import {
	parseUrl,
	getHeaders,
	convertArrayToHeaders,
	getCustomHeaders,
} from '../utils';
import { SETTINGS } from '../constants';

export const getAnalyzersApi = async (rawUrl, indexName) => {
	const defaultError = 'Unable to get version';
	try {
		const { url } = parseUrl(rawUrl);
		const headers = getHeaders(rawUrl);

		let fetchUrl = url;
		let fetchHeaders = {};

		if (indexName) {
			fetchUrl = `${url}/${indexName}/_settings`;
			fetchHeaders = convertArrayToHeaders(getCustomHeaders(indexName));
		}

		const res = await fetch(fetchUrl, {
			headers: {
				...headers,
				...fetchHeaders,
			},
			method: 'GET',
		}).then(response => response.json());

		if (res.status >= 400) {
			throw new CustomError(
				JSON.stringify(res.error, null, 2),
				`HTTP STATUS: ${res.status} - ${defaultError}`,
			);
		}

		return Object.keys(
			(res[indexName].settings.index.analysis || {}).analyzer || {},
		);
	} catch (error) {
		throw new CustomError(
			error.description || defaultError,
			error.message,
			error.stack,
		);
	}
};

export const closeApp = async (rawUrl, indexName) => {
	const defaultError = 'Unable to get version';
	try {
		const { url } = parseUrl(rawUrl);
		const headers = getHeaders(rawUrl);

		let fetchUrl = url;
		let fetchHeaders = {};

		if (indexName) {
			fetchUrl = `${url}/${indexName}/_close`;
			fetchHeaders = convertArrayToHeaders(getCustomHeaders(indexName));
		}

		const res = await fetch(fetchUrl, {
			headers: {
				...headers,
				...fetchHeaders,
			},
			method: 'POST',
		}).then(response => response.json());

		if (res.status >= 400) {
			throw new CustomError(
				JSON.stringify(res.error, null, 2),
				`HTTP STATUS: ${res.status} - ${defaultError}`,
			);
		}

		return res;
	} catch (error) {
		throw new CustomError(
			error.description || defaultError,
			error.message,
			error.stack,
		);
	}
};

export const openApp = async (rawUrl, indexName) => {
	const defaultError = 'Unable to get version';
	try {
		const { url } = parseUrl(rawUrl);
		const headers = getHeaders(rawUrl);

		let fetchUrl = url;
		let fetchHeaders = {};

		if (indexName) {
			fetchUrl = `${url}/${indexName}/_open`;
			fetchHeaders = convertArrayToHeaders(getCustomHeaders(indexName));
		}

		const res = await fetch(fetchUrl, {
			headers: {
				...headers,
				...fetchHeaders,
			},
			method: 'POST',
		}).then(response => response.json());

		if (res.status >= 400) {
			throw new CustomError(
				JSON.stringify(res.error, null, 2),
				`HTTP STATUS: ${res.status} - ${defaultError}`,
			);
		}

		return res;
	} catch (error) {
		throw new CustomError(
			error.description || defaultError,
			error.message,
			error.stack,
		);
	}
};

export const putSettings = async (rawUrl, indexName) => {
	const defaultError = 'Unable to get version';
	try {
		const { url } = parseUrl(rawUrl);
		const headers = getHeaders(rawUrl);

		let fetchUrl = url;
		let fetchHeaders = {};

		if (indexName) {
			fetchUrl = `${url}/${indexName}/_settings`;
			fetchHeaders = convertArrayToHeaders(getCustomHeaders(indexName));
		}

		const res = await fetch(fetchUrl, {
			headers: {
				...headers,
				...fetchHeaders,
			},
			method: 'PUT',
			body: JSON.stringify(SETTINGS),
		}).then(response => response.json());

		if (res.status >= 400) {
			throw new CustomError(
				JSON.stringify(res.error, null, 2),
				`HTTP STATUS: ${res.status} - ${defaultError}`,
			);
		}

		return res;
	} catch (error) {
		throw new CustomError(
			error.description || defaultError,
			error.message,
			error.stack,
		);
	}
};
