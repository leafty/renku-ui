/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

/**
 *  incubator-renga-ui
 *
 *  Dataset.js
 *  Module for dataset features.
 */

import React, { Component } from 'react';
import human from 'human-time';

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider, connect } from 'react-redux'
import thunk from 'redux-thunk';

import { Row, Col } from 'reactstrap';
import { Button, ButtonGroup, FormGroup, FormText, Input, Label } from 'reactstrap';
import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap'

import State from './DatasetState'
import { Avatar } from '../UIComponents'

class FieldGroup extends Component {
  render() {
    const label = this.props.label,
      help = this.props.help,
      props = this.props;
    return <FormGroup>
      <Label>{label}</Label>
      <Input {...props} />
      {help && <FormText color="muted">{help}</FormText>}
    </FormGroup>
  }
}

class DataVisibility extends Component {
  render() {
    return <FormGroup>
        <Label>Visibility</Label>
        <Input type="select" placeholder="visibility" value={this.props.value.level} onChange={this.props.onChange}>
          <option value="public">Public</option>
          <option value="restricted">Restricted</option>
        </Input>
      </FormGroup>
  }
}

class FileUpload extends Component {
  // From https://bootsnipp.com/snippets/featured/bootstrap-drag-and-drop-upload
  render() {
    return (<div>
      <CardTitle>Select Files</CardTitle>
      <div className="form-inline">
        <div className="form-group">
          <input type="file" name="files[]" id="js-upload-files" multiple />
        </div>
        <button type="submit" className="btn btn-sm btn-primary" id="js-upload-submit">Upload</button>
      </div>
    </div>)
  }
}

class ReferenceSpecification extends Component {

  render() {
    return [
      <CardTitle key="title">Reference</CardTitle>,
      <FieldGroup key="url" id="url" type="text" label="URL or DOI"
        placeholder="The URL or DOI for the dataset" value={this.props.value.url_or_doi} onChange={(v) => this.props.onChange("url_or_doi", v)} />,
      <FieldGroup key="author" id="author" type="text" label="Author"
        placeholder="The author of the original data" value={this.props.value.author}
        onChange={(v) => this.props.onChange("author", v)} />,
    ]
  }
}

class DataRegistration extends Component {
  constructor(props) {
    super(props);
    this.state = { registration: "reference" }
  }

  handleChange(v) {
    this.setState({registration: v});
  }

  render() {
    const buttonToolbar = (
      <ButtonGroup>
        <Button onClick={() => this.handleChange("reference")} active={this.state.registration === "reference"}>Reference</Button>
        <Button onClick={() => this.handleChange("upload")} active={this.state.registration === "upload"}>Upload</Button>
      </ButtonGroup>);
    const panelChild =
      this.state.registration === "reference" ?
        <ReferenceSpecification value={this.props.value.reference} onChange={this.props.onReferenceChange} /> :
        <FileUpload value={this.props.value.upload} onChange={null}  />
    return (
      <Card>
        <CardHeader>{buttonToolbar}</CardHeader>
        <CardBody>{panelChild}</CardBody>
      </Card>
    )
  }
}

class NewDataSet extends Component {

  render() {
    const titleHelp = this.props.core.displayId.length > 0 ? `Id: ${this.props.core.displayId}` : null;
    return <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
      <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the dataset" help={titleHelp}
        value={this.props.core.title} onChange={this.props.onTitleChange} />
      <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the dataset" help="A description of the data set helps users understand it and is highly recommended."
        value={this.props.core.description} onChange={this.props.onDescriptionChange} />
      <DataVisibility value={this.props.visibility} onChange={this.props.onVisibilityChange} />
      <DataRegistration value={this.props.data} onReferenceChange={this.props.onDataReferenceChange} />
      <br />
      <Button color="primary" onClick={this.props.onSubmit}>
        Create
      </Button>
    </form>
  }
}

class New extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.reducer);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  submitData() {
    // For the moment we submit only limited information.
    return this.store.getState()['core'];
  }

  handleSubmit() {
    const body = JSON.stringify(this.submitData());
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    fetch("api/datasets/", {method: 'POST', headers: headers, body: body})
        .then( (response) => {
            if (response.ok) {
              response.json().then( newDataset => {
                console.log("New Dataset created", newDataset)
              });
            }
        });
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
      onTitleChange: (e) => { dispatch(State.Core.set('title', e.target.value)) },
      onDescriptionChange: (e) => { dispatch(State.Core.set('description', e.target.value)) },
      onVisibilityChange: (e) => { dispatch(State.Visibility.set(e.target.value)) },
      onDataReferenceChange: (key, e) => { dispatch(State.Data.set("reference", key, e.target.value)) }
    }
  }

  render() {
    const VisibleNewDataSet = connect(this.mapStateToProps, this.mapDispatchToProps)(NewDataSet);
    return [
      <Row key="header"><Col md={8}><h1>New Dataset</h1></Col></Row>,
      <Provider key="new" store={this.store}>
        <Row><Col md={8}><VisibleNewDataSet onSubmit={this.onSubmit} /></Col></Row>
      </Provider>
    ]
  }
}

class View extends Component {
  render() {
    return <h1 key="header">Dataset View</h1>
  }
}

function fetchDatasets() {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  return fetch("/api/datasets/", {headers});
}

function listDatasets() {
  return (dispatch) => {
    return fetchDatasets().then(
      results => results.json().then(d => dispatch(State.ServerReturn.set(d)))
    )
  }
}

function createStoreWithReduxUi(reducer) {
  const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(thunk),
    // other store enhancers if any
  );
  return createStore(reducer, enhancer);
}

class DataSetListRow extends Component {
  displayMetadataValue(field, defaultValue) {
    let value = this.props.metadata[field];
    if (value == null) value = defaultValue;
    return value;
  }
  formatTime(time) {
    return human((new Date() - new Date(time)) / 1000)
  }
  render() {
    const title = this.displayMetadataValue('title', "no title");
    const description = this.displayMetadataValue('description', "no description");
    const time = this.props.updated;

    return (
      <Row className="dataset-list-row">
         <Col md={1}><Avatar  /></Col>
         <Col md={9}><p><b>{title}</b></p><p>{description}</p></Col>
         <Col md={2}><p>{this.formatTime(time)}</p></Col>
       </Row>
      );
  }
}

class DataSetList extends Component {
  render() {
    const datasets = this.props.datasets;
    const rows = datasets.map((d, i) => <DataSetListRow key={i} {...d} />);
    return [
      <Row key="header"><Col md={8}><h1>Dataset List</h1></Col></Row>,
      <Row key="spacer"><Col md={8}>&nbsp;</Col></Row>,
      <Row key="timeline"><Col md={8}>{rows}</Col></Row>
   ]
  }
}


class List extends Component {
  constructor(props) {
    super(props);
    // this.store = createStore(State.ServerReturn.reduce, applyMiddleware(thunk));

    this.store = createStoreWithReduxUi(State.ServerReturn.reduce);
    this.store.dispatch(listDatasets());
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
    }
  }

  render() {
    const VisibleDataSetList = connect(this.mapStateToProps, this.mapDispatchToProps)(DataSetList);
    return [
      <Provider key="new" store={this.store}>
        <VisibleDataSetList onSubmit={this.onSubmit} />
      </Provider>
    ]
  }
}

export default { New, View, List };
