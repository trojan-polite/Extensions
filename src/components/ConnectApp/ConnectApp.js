// @flow

import React, { Component } from 'react';
import { Form, Button, Alert, AutoComplete, Input, Modal } from 'antd';
import { connect } from 'react-redux';
import { string, func, bool, object, array } from 'prop-types';
import { withRouter } from 'react-router-dom';

import {
	getAppname,
	getUrl,
	getIsLoading,
	getIsConnected,
	getHeaders,
} from '../../reducers/app';
import { connectApp, disconnectApp, setMode, setHeaders } from '../../actions';
import {
	getUrlParams,
	getLocalStorageItem,
	setLocalStorageData,
	getCustomHeaders,
} from '../../utils';

import { getMode } from '../../reducers/mode';
import { LOCAL_CONNECTIONS, MODES } from '../../constants';

import Flex from '../Flex';

type Props = {
	appname?: string,
	url?: string,
	connectApp: (string, string) => void,
	disconnectApp: () => void,
	isConnected: boolean,
	isLoading: boolean,
	error?: object,
	history: object,
	mode: string,
	setMode: string => void,
	onErrorClose: () => void,
	headers: any[],
	setHeaders: any => void,
};

type State = {
	appname: string,
	url: string,
	pastApps: any[],
	isShowingAppSwitcher: boolean,
	isUrlHidden: boolean,
	isShowingHeadersModal: boolean,
	customHeaders: any[],
};

const { Item } = Form;
const { Group } = Input;

const formItemProps = {
	wrapperCol: {
		xs: {
			span: 24,
		},
	},
};

class ConnectApp extends Component<Props, State> {
	state = {
		appname: this.props.appname || '',
		url: this.props.url || '',
		pastApps: [],
		isShowingAppSwitcher: true,
		isUrlHidden: false,
		isShowingHeadersModal: false,
		customHeaders: this.props.headers.length
			? this.props.headers
			: [{ key: '', value: '' }],
	};

	componentDidMount() {
		// sync state from url
		let appname = '';
		let url = '';
		const { mode } = this.props;
		const {
			appname: queryApp,
			url: queryUrl,
			mode: queryMode,
			sidebar,
			appswitcher,
		} = getUrlParams(window.location.search);

		if (queryApp && queryUrl) {
			appname = queryApp;
			url = queryUrl;
		} else {
			const { appname: propApp, url: propUrl } = this.props;
			appname = propApp || '';
			url = propUrl || '';
		}

		this.setState({
			appname,
			url,
		});

		if (appname && url) {
			this.props.connectApp(appname, url);
		}

		if (!queryApp && !queryUrl) {
			let searchQuery = `?appname=${appname}&url=${url}`;
			const currentMode = queryMode || mode;
			searchQuery += `&mode=${currentMode}`;

			if (sidebar) {
				searchQuery += `&sidebar=${sidebar}`;
			}

			if (appswitcher) {
				searchQuery += `&appswitcher=${appswitcher}`;
			}

			this.props.setMode(currentMode);
			this.props.history.push({ search: searchQuery });
		}

		if (queryMode) {
			this.props.setMode(queryMode);
		}

		if (appswitcher && appswitcher === 'false') {
			this.setAppSwitcher(false);
		}

		const customHeaders = getCustomHeaders(appname);

		this.props.setHeaders(customHeaders);
		this.setState({
			customHeaders: customHeaders.length
				? customHeaders
				: [{ key: '', value: '' }],
		});
		this.setPastConnections();
	}

	setAppSwitcher = isShowingAppSwitcher => {
		this.setState({
			isShowingAppSwitcher,
		});
	};

	setPastConnections = () => {
		setTimeout(() => {
			const pastConnections = JSON.parse(
				// $FlowFixMe
				getLocalStorageItem(LOCAL_CONNECTIONS) || {},
			);

			this.setState({
				pastApps: pastConnections.pastApps || [],
			});
		}, 100);
	};

	handleChange = e => {
		const { value, name } = e.target;
		this.setState({
			[name]: value,
		});
	};

	handleAppNameChange = appname => {
		const { pastApps } = this.state;
		const pastApp = pastApps.find(app => app.appname === appname);

		if (pastApp) {
			this.setState({
				url: pastApp.url,
				customHeaders: pastApp.headers || [],
			});
		}
		this.setState({
			appname,
		});
	};

	handleSubmit = e => {
		e.preventDefault();
		const { appname, url, customHeaders } = this.state;
		const { sidebar, appswitcher } = getUrlParams(window.location.search);

		let searchQuery = '?';

		if (sidebar) {
			searchQuery += `&sidebar=${sidebar}`;
		}

		if (appswitcher) {
			searchQuery += `&appswitcher=${appswitcher}`;
		}

		if (this.props.isConnected) {
			this.props.disconnectApp();
			this.props.setMode(MODES.VIEW);

			this.props.history.push({ search: searchQuery });
		} else if (appname && url) {
			this.props.connectApp(appname, url);
			this.props.setHeaders(customHeaders);
			// update history with correct appname and url
			searchQuery += `&appname=${appname}&url=${url}&mode=${
				this.props.mode
			}`;
			const { pastApps } = this.state;
			const newApps = [...pastApps];

			const pastApp = pastApps.find(app => app.appname === appname);

			if (!pastApp) {
				newApps.push({
					appname,
					url,
					headers: customHeaders,
				});
			} else {
				const appIndex = newApps.findIndex(
					item => item.appname === appname,
				);

				newApps[appIndex] = {
					appname,
					url,
					headers: customHeaders,
				};
			}

			this.setState({
				pastApps: newApps,
			});

			setLocalStorageData(
				LOCAL_CONNECTIONS,
				JSON.stringify({
					pastApps: newApps,
				}),
			);
			this.props.history.push({ search: searchQuery });
		}
	};

	handleUrlToggle = () => {
		this.setState(({ isUrlHidden }) => ({
			isUrlHidden: !isUrlHidden,
		}));
	};

	toggleHeadersModal = () => {
		this.setState(({ isShowingHeadersModal }) => ({
			isShowingHeadersModal: !isShowingHeadersModal,
		}));
	};

	handleHeaderItemChange = (e, index, field) => {
		const {
			target: { value },
		} = e;
		const { customHeaders } = this.state;

		this.setState({
			customHeaders: [
				...customHeaders.slice(0, index),
				{
					...customHeaders[index],
					[field]: value,
				},
				...customHeaders.slice(index + 1),
			],
		});
	};

	handleHeadersSubmit = () => {
		const { customHeaders } = this.state;

		const filteredHeaders = customHeaders.filter(
			item => item.key.trim() && item.value.trim(),
		);

		this.props.setHeaders(filteredHeaders);
		this.toggleHeadersModal();
	};

	addMoreHeader = () => {
		const { customHeaders } = this.state;

		this.setState({
			customHeaders: [...customHeaders, { key: '', value: '' }],
		});
	};

	handleHeaderAfterClose = () => {
		this.setState({
			customHeaders: this.props.headers.length
				? this.props.headers
				: [{ key: '', value: '' }],
		});
	};

	render() {
		const {
			appname,
			url,
			pastApps,
			isShowingAppSwitcher,
			isUrlHidden,
			isShowingHeadersModal,
			customHeaders,
		} = this.state;
		const { isLoading, isConnected } = this.props;
		return (
			<div>
				{isShowingAppSwitcher && (
					<Form
						layout="inline"
						onSubmit={this.handleSubmit}
						css={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<Item {...formItemProps} css={{ flex: 1 }}>
							<Group
								compact
								css={{
									display: 'flex !important',
								}}
							>
								<Input
									name="url"
									value={url}
									placeholder="URL for cluster goes here. e.g.  https://username:password@scalr.api.appbase.io"
									onChange={this.handleChange}
									disabled={isConnected}
									required
									css={{
										color:
											isUrlHidden &&
											'transparent !important',
									}}
								/>
								<Button
									css={{
										cursor: 'pointer',
										'&:hover': {
											borderColor: '#d9d9d9 !important',
										},
									}}
									onClick={this.handleUrlToggle}
								>
									<i
										className={`fa ${
											isUrlHidden
												? 'fa-eye-slash'
												: 'fa-eye'
										}`}
									/>
								</Button>
								<Button
									type="button"
									css={{
										'&:hover': {
											borderColor: '#d9d9d9 !important',
										},
									}}
									onClick={this.toggleHeadersModal}
								>
									Headers
								</Button>
							</Group>
						</Item>
						<Item {...formItemProps}>
							<AutoComplete
								dataSource={pastApps.map(app => app.appname)}
								value={appname}
								placeholder="Appname (aka index) goes here"
								filterOption={(inputValue, option) =>
									option.props.children
										.toUpperCase()
										.indexOf(inputValue.toUpperCase()) !==
									-1
								}
								onChange={this.handleAppNameChange}
								disabled={isConnected}
							/>
						</Item>

						<Item
							css={{
								marginRight: '0px !important',
							}}
						>
							<Button
								type={isConnected ? 'danger' : 'primary'}
								htmlType="submit"
								icon={
									isConnected ? 'pause-circle' : 'play-circle'
								}
								disabled={!(appname && url)}
								loading={isLoading}
							>
								{isConnected ? 'Disconnect' : 'Connect'}
							</Button>
						</Item>
						<Modal
							visible={isShowingHeadersModal}
							onCancel={this.toggleHeadersModal}
							onOk={this.handleHeadersSubmit}
							maskClosable={false}
							destroyOnClose
							title="Add Custom Headers"
							css={{ top: 10 }}
							afterClose={this.handleHeaderAfterClose}
						>
							<div
								css={{
									maxHeight: '500px',
									overflow: 'auto',
									paddingRight: 10,
								}}
							>
								<Flex css={{ marginBottom: 10 }}>
									<div css={{ flex: 1 }}>Key</div>
									<div css={{ marginLeft: 10, flex: 1 }}>
										Value
									</div>
								</Flex>
								{customHeaders.map((item, i) => (
									<Flex
										key={`header-${i}`} // eslint-disable-line
										css={{ marginBottom: 10 }}
									>
										<div css={{ flex: 1 }}>
											<Input
												value={item.key}
												onChange={e =>
													this.handleHeaderItemChange(
														e,
														i,
														'key',
													)
												}
											/>
										</div>
										<div css={{ marginLeft: 10, flex: 1 }}>
											<Input
												value={item.value}
												onChange={e =>
													this.handleHeaderItemChange(
														e,
														i,
														'value',
													)
												}
											/>
										</div>
									</Flex>
								))}
							</div>
							<Button
								icon="plus"
								type="primary"
								css={{
									marginTop: 10,
								}}
								onClick={this.addMoreHeader}
							/>
						</Modal>
					</Form>
				)}
				{!isLoading &&
					!isConnected && (
						<Alert
							type="info"
							showIcon
							message="Connecting to ElasticSearch"
							description={
								<div>
									<p>
										To make sure you enable CORS settings
										for your ElasticSearch instance, add the
										following lines in the ES configuration
										file:
									</p>
									<pre>
										{`http.port: 9200
http.cors.allow-origin: http://localhost:1358
http.cors.enabled: true
http.cors.allow-headers : X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization
http.cors.allow-credentials: true`}
									</pre>
								</div>
							}
						/>
					)}
			</div>
		);
	}
}

const mapStateToProps = state => ({
	appname: getAppname(state),
	url: getUrl(state),
	isConnected: getIsConnected(state),
	isLoading: getIsLoading(state),
	mode: getMode(state),
	headers: getHeaders(state),
});

const mapDispatchToProps = {
	connectApp,
	disconnectApp,
	setMode,
	setHeaders,
};

ConnectApp.propTypes = {
	appname: string,
	url: string,
	connectApp: func.isRequired,
	disconnectApp: func.isRequired,
	isConnected: bool.isRequired,
	isLoading: bool.isRequired,
	history: object,
	setMode: func.isRequired,
	mode: string,
	headers: array,
	setHeaders: func,
};

export default withRouter(
	connect(
		mapStateToProps,
		mapDispatchToProps,
	)(ConnectApp),
);
