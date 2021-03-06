'use strict';

declare interface NodeType {
	root: boolean;
	id: number;
	name: number;
	type: 'solved' | 'unsolved';
}
declare interface AlchemyType {
	begin(config: Record<string, any>): void;
}
declare const alchemy: AlchemyType;

// eslint-disable-next-line require-await
(async () => {
	const my_problems: number[] = await (await fetch('/user_problems')).json();
	const my_problems_set = new Set(my_problems);
	// the problem structure for every problem (visible and not visible)
	const global_graph: number[][] = await (await fetch('/graph.json')).json(); // index is node number - 1 (so idx 0 = first node)
	const my_graph: (number | undefined)[][] = [];
	for (const problem of my_problems) {
		my_graph[problem - 1] = global_graph[problem - 1].filter(Set.prototype.has, my_problems_set); // index is 1 less than problem number
	}
	const config: Record<string, any> = {
		'edgeStyle': {
			'all': {
				'color': '#606c76',
				'hidden': {
					'color': '#606c76',
				},
				'highlighted': {
					'color': '#606c76',
				},
				'opacity': 0.2,
				'selected': {
				},
				'width': 4,
			},
		},
		'fixNodes': false,
		'fixRootNodes': true,
		'initialTranslate': [ 0, 0, ],
		'nodeCaption': (node: NodeType) => {
			return `Problem  ${node.name}`;
		},
		'nodeCaptionsOnByDefault': true,
		'nodeRadius': 20,
		'nodeStyle': {
			'solved': {
				'borderColor': 'none',
				'color': '#9b4dca',
				'radius'(d: { getProperties(): NodeType }) {
					if (d.getProperties().root) { return 20; } return 10;
				},
			},
			'unsolved': {
				'borderColor': 'none',
				'color': '#ffa9d2',
				'opacity': 0.2,
				'radius'(d: { getProperties(): NodeType }) {
					if (d.getProperties().root) { return 20; } return 10;
				},
			},
		},
		'nodeTypes': { 'type':
					[ 'solved', 'unsolved', ],
		},
		'rootNodeRadius': 70,
	};
	// start alchemy
	config.dataSource = {
		'edges': my_graph.reduce((acc: {source: number, target: number}[], targets, source_idx: number) => { // source problem number = source_idx + 1
			if (typeof targets !== 'undefined') { // my_graph is sparse
				targets.filter(Set.prototype.has, my_problems_set).forEach(target => acc.push({
					'source': source_idx + 1,
					target,
				}));
			}
			return acc;
		}, []),
		'nodes': my_graph.reduce((acc: NodeType[], problem_s_children, problem_idx: number) => { // add 1 to problem_idx to get the problem number
			if (typeof problem_s_children !== 'undefined') { // my_graph is sparse
				acc.push({
					'id': problem_idx + 1,
					'name': problem_idx + 1,
					'root': !problem_idx, // node_idx === 0
					'type': problem_s_children.length ? 'solved' : 'unsolved', // if there are children, it's solved
				});
			}
			return acc;
		}, []),
	};
	alchemy.begin(config);
})().catch((reason) => {
	console.log(reason);
});
