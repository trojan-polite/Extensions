// @flow

import React, { Component, Fragment } from 'react';
import { Modal, Input, Row, Col, Button, Form } from 'antd';
import { object } from 'prop-types';
import { connect } from 'react-redux';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';

import {
	setError,
	clearError,
	updateReactiveList,
	setUpdatingRow,
	setSelectedRows,
	fetchMappings,
} from '../../actions';
import { isVaildJSON, getOnlySource } from '../../utils';
import { getUpdatingRow } from '../../reducers/updatingRow';
import { getUrl } from '../../reducers/app';
import { putData } from '../../apis/data';

const { Item } = Form;

type Props = {
	data: object,
	appUrl: string,
	setError: any => void,
	clearError: () => void,
	updateReactiveList: () => void,
	setSelectedRows: any => void,
	setUpdatingRow: any => void,
	fetchMappings: () => void,
};

type State = {
	isShowingModal: boolean,
	dataError: boolean,
	jsonValue: string,
};

class UpdateRowModal extends Component<Props, State> {
	state = {
		isShowingModal: false,
		dataError: false,
		jsonValue: JSON.stringify(
			getOnlySource(this.props.data || {}),
			null,
			2,
		),
	};

	handleAfterClose = () => {
		this.setState({
			dataError: false,
		});
	};

	handleJsonInput = (val: any) => {
		this.setState({
			dataError: !isVaildJSON(val),
			jsonValue: val,
		});
	};

	toggleModal = () => {
		this.setState(prevState => ({
			isShowingModal: !prevState.isShowingModal,
		}));
	};

	handleSubmit = async () => {
		const { dataError, jsonValue } = this.state;
		const { _id: documentId, _index: index, _type: type } = this.props.data;

		if (!dataError) {
			const {
				appUrl,
				setError: onSetError,
				clearError: onClearError,
				updateReactiveList: onUpdateReactiveList,
				setSelectedRows: onSetSelectedRows,
				setUpdatingRow: onSetUpdatingRow,
				fetchMappings: onFetchMappings,
			} = this.props;

			try {
				onClearError();
				await putData(
					index,
					type,
					documentId,
					appUrl,
					JSON.parse(jsonValue),
				);
				onUpdateReactiveList();
				onSetUpdatingRow(null);
				onSetSelectedRows([]);
				onFetchMappings();
			} catch (error) {
				onSetError(error);
			}
			this.toggleModal();
		}
	};

	render() {
		const { isShowingModal, dataError, jsonValue } = this.state;
		const { _id: documentId, _index: index, _type: type } = this.props.data;

		return (
			<Fragment>
				<Button
					icon="edit"
					type="primary"
					css={{
						margin: '0 3px',
					}}
					onClick={this.toggleModal}
				>
					Update
				</Button>

				<Modal
					visible={isShowingModal}
					onCancel={this.toggleModal}
					afterClose={this.handleAfterClose}
					onOk={this.handleSubmit}
					okButtonProps={{ disabled: dataError }}
					destroyOnClose
					css={{
						top: '10px',
					}}
					maskClosable={false}
				>
					<Row>
						<Col span={12}>
							<Item label="Index" css={{ marginRight: '10px' }}>
								<Input name="index" value={index} disabled />
							</Item>
						</Col>
						<Col span={12}>
							<Item label="Type">
								<Input name="type" value={type} disabled />
							</Item>
						</Col>
					</Row>
					<Item label="Document Id">
						<Input
							name="document_id"
							value={documentId}
							disabled
							placeholder="Enter document id"
						/>
					</Item>
					<Item label="JSON document" />
					<AceEditor
						tabSize={2}
						mode="json"
						theme="github"
						onChange={this.handleJsonInput}
						name="add-row-modal"
						value={jsonValue}
						height="auto"
						width="100%"
						css={{
							minHeight: '200px',
							maxHeight: '300px',
						}}
					/>
				</Modal>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
	appUrl: getUrl(state),
	data: getUpdatingRow(state),
});

const mapDispatchToProps = {
	setError,
	clearError,
	updateReactiveList,
	setSelectedRows,
	setUpdatingRow,
	fetchMappings,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(UpdateRowModal);
