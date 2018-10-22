import React, { Component } from 'react';
import { ReactiveBase, ReactiveList } from '@appbaseio/reactivesearch';
import { connect } from 'react-redux';
import { string, func, bool, object, number, arrayOf } from 'prop-types';
import { Skeleton, Button } from 'antd';

import DataTable from '../DataTable';
import AddFieldModal from '../AddFieldModal';

import { fetchMappings } from '../../actions';
import { getAppname, getUrl } from '../../reducers/app';
import * as dataSelectors from '../../reducers/data';
import {
	getIsLoading,
	getMappings,
	getIndexes,
	getTypes,
} from '../../reducers/mappings';
import { parseUrl } from '../../utils';

// after app is connected DataBrowser takes over
class DataBrowser extends Component {
	state = {
		showModal: false,
	};

	componentDidMount() {
		this.props.fetchMappings();
	}

	toggleModal = () => {
		this.setState(({ showModal }) => ({
			showModal: !showModal,
		}));
	};

	render() {
		const {
			appname,
			url: rawUrl,
			isLoading,
			mappings,
			reactiveListKey,
			isDataLoading,
			indexes,
			types,
		} = this.props;
		const { showModal } = this.state;
		const { credentials, url } = parseUrl(rawUrl);

		return (
			<Skeleton loading={isLoading} active>
				{!isLoading &&
					mappings && (
						<ReactiveBase
							app={indexes.join(',')}
							type={types.join(',')} // to ignore bloat types need to rethink for multi indices
							credentials={credentials}
							url={url}
						>
							<AddFieldModal
								showModal={showModal}
								toggleModal={this.toggleModal}
							/>
							<div
								css={{
									display: 'flex',
									flexDirection: 'row-reverse',
									margin: '20px 0',
								}}
							>
								<Button
									icon="plus"
									type="primary"
									onClick={this.toggleModal}
									loading={isDataLoading}
								>
									Add Column
								</Button>
							</div>
							<ReactiveList
								// whenever a data change is expected, the key is updated to make the ReactiveList refetch data
								// there should ideally be a hook in ReactiveSearch for this purpose but this will suffice for now
								key={String(reactiveListKey)}
								componentId="results"
								dataField="_id"
								pagination
								showResultStats
								onAllData={data => (
									// onAllData is invoked only when data changes
									<DataTable
										// if key logic fails for an edge case will have to derive state in DataTable from props
										key={data.length ? data[0]._id : '0'}
										data={data}
										mappings={mappings[appname]}
										shouldRenderIndexColumn={
											indexes.length > 1
										}
									/>
								)}
							/>
						</ReactiveBase>
					)}
			</Skeleton>
		);
	}
}

const mapStateToProps = state => ({
	appname: getAppname(state),
	url: getUrl(state),
	isLoading: getIsLoading(state),
	mappings: getMappings(state),
	reactiveListKey: dataSelectors.getReactiveListKey(state),
	isDataLoading: dataSelectors.getIsLoading(state),
	indexes: getIndexes(state),
	types: getTypes(state),
});

const mapDispatchToProps = {
	fetchMappings,
};

DataBrowser.propTypes = {
	appname: string.isRequired,
	url: string.isRequired,
	fetchMappings: func.isRequired,
	isLoading: bool.isRequired,
	mappings: object,
	reactiveListKey: number.isRequired,
	isDataLoading: bool.isRequired,
	indexes: arrayOf(string),
	types: arrayOf(string),
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DataBrowser);
