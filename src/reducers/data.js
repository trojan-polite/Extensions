import { DATA, MAPPINGS } from '../actions/constants';

const initialState = {
	reactiveListKey: 0, // to remount ReactiveList and get fresh data
	isLoading: false,
	error: null,
};

// a single state for data addition in the app currently, might need separation of concern later
const data = (state = initialState, action) => {
	const { type, error } = action;
	const { reactiveListKey } = state;
	switch (type) {
		case DATA.ADD_DATA_REQUEST:
		case MAPPINGS.ADD_MAPPING_REQUEST:
			return {
				...state,
				isLoading: true,
				error: null,
			};
		case DATA.ADD_DATA_SUCCESS:
		case MAPPINGS.ADD_MAPPING_SUCCESS:
			return {
				reactiveListKey: reactiveListKey + 1,
				isLoading: false,
				error: null,
			};
		case DATA.ADD_DATA_FAILURE:
		case MAPPINGS.ADD_MAPPING_FAILURE:
			return {
				...state,
				isLoading: false,
				error,
			};
		case MAPPINGS.MAPPINGS_FETCH_SUCCESS:
			// there might be a wasted render between add mapping success and fetch mapping success but
			// this simplifies the flow a lot for now (time constraints)
			return {
				...state,
				reactiveListKey: reactiveListKey + 1,
			};
		default:
			return state;
	}
};

// selectors
const getReactiveListKey = state => state.data.reactiveListKey;
const getIsLoading = state => state.data.isLoading;
const getError = state => state.data.error;

export { getReactiveListKey, getIsLoading, getError };

export default data;
