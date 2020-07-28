// @flow

import React from 'react';
import { object } from 'prop-types';
import { Icon } from 'antd';
import Hash from '../Icons/Hash';
import Toggle from '../Icons/Toggle';

type Props = {
	mapping: object,
};

const MappingsIcon = ({ mapping, ...props }: Props) => {
	const { type } = mapping;
	switch (type) {
		case 'text':
		case 'keyword':
		case 'string':
			return <Icon type="message" {...props} />;
		case 'integer':
		case 'long':
			return <Hash size={14} {...props} />;
		case 'geo_point':
		case 'geo_shape':
			return <Icon type="environment" {...props} />;
		case 'boolean':
			return <Toggle size={14} {...props} />;
		case 'date':
			return <Icon type="calendar" {...props} />;
		case 'float':
		case 'double':
			return (
				<span css={{ cursor: 'pointer' }} {...props}>
					π
				</span>
			);
		default:
			return (
				<span css={{ cursor: 'pointer' }} {...props}>{`{...}`}</span>
			);
	}
};

export default MappingsIcon;
