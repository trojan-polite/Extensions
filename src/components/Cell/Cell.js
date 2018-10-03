import React from 'react';
import { func, number, string, bool, any } from 'prop-types';
import { Input } from 'antd';

const { TextArea } = Input;

const Cell = ({ active, children, onChange, onFocus, row, column }) => (
	<div
		onFocus={() => onFocus(row, column)}
		onBlur={() => {
			onFocus(null, null);
		}}
		tabIndex="0"
		role="Gridcell"
		css={{
			width: 250,
			height: '100%',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
			padding: active ? 0 : 10,
			outline: 'none',
		}}
	>
		{active ? (
			<TextArea
				autoFocus
				autosize
				defaultValue={children}
				onBlur={e => {
					const { value } = e.target;
					if (value !== children) {
						// only change value if something was changed
						onChange(row, column, value);
					}
				}}
			/>
		) : (
			children
		)}
	</div>
);

Cell.propTypes = {
	children: any,
	onFocus: func.isRequired,
	row: number.isRequired,
	column: string.isRequired,
	active: bool.isRequired,
	onChange: func.isRequired,
};

export default Cell;
