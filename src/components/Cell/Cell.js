import React from 'react';
import { func, number, string, bool, any } from 'prop-types';

import BooleanCell from './BooleanCell';
import TextCell from './TextCell';
import NumberCell from './NumberCell';
import ArrayCell from './ArrayCell';

const Cell = ({ mapping, ...props }) => {
	switch (mapping.type) {
		case 'boolean':
			return <BooleanCell {...props} />;
		case 'integer':
		case 'long':
			return <NumberCell {...props} />;
		default:
			if (Array.isArray(props.children)) {
				return <ArrayCell {...props} />;
			}
			return <TextCell {...props} />;
	}
};

Cell.propTypes = {
	children: any,
	onFocus: func.isRequired,
	row: number.isRequired,
	column: string.isRequired,
	active: bool.isRequired,
	onChange: func.isRequired,
};

export default Cell;
