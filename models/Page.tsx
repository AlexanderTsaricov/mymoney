import type { ComponentType } from 'react';
import React from 'react';
import { Text } from 'react-native';

class Page extends React.Component {
	title: string;
	name: string;
	component: ComponentType<any>;

	constructor(title: string, name: string, component: ComponentType<any>) {
		super({});
		this.title = title;
		this.name = name;
		this.component = component;
	}

	Screen() {
		return (<Text>Базовая страница</Text>);
	}
}

export default Page;