/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Graph } from 'react-d3-graph';
import dot from 'graphlib-dot';

class FileLineageGraph extends Component {
  graph() { return dot.read(this.props.dot) }

  render() {
    const graph = this.graph();
    // label should be name of file without quotes
    const nodes = graph.nodes().map(n => ({id: n, label: n.split(',')[1].slice(2, -2)}));
    if (nodes.length < 1) return <p></p>;
    const links = graph.edges().map(e => ({source: e.v, target: e.w}));
    const config = {node: {fontSize: 12, labelProperty: 'label'}};
    return <Graph id="lineage" config={config} data={{nodes, links}} />
  }
}

class FileLineage extends Component {
  render() {
    const graph = (this.props.dot) ?
      <FileLineageGraph path={this.props.path} dot={this.props.dot} /> :
      <p>Loading...</p>;
    return [<Row key="header"><Col><h3>{this.props.path}</h3></Col></Row>,
      <Row key="graph"><Col>{graph}</Col></Row>
    ]
  }
}

export { FileLineage };
