import React, { Component } from "react";
import { connect } from "react-redux";
import Select from "react-select";

import { getAllPersons } from "../reducers";
import { searchPersonByName } from "../actions/person";

import block from "../helpers/BEM";
import "../styles/SearchPerson.less";

const b = block("SearchPerson");

class SearchPerson extends Component {
  state = {
    options: []
  };

  static getDerivedStateFromProps = ({ persons }) => {
    return {
      options: persons.map(({ name: label, _id: value }) => ({ label, value }))
    };
  };

  handleChange = value => {
    this.props.searchPersonByName(value);
  };

  render() {
    const { options } = this.state;
    // console.log(options);
    // console.log(this.props.value);

    return (
      <Select
        simpleValue={true}
        {...this.props}
        onInputChange={this.handleChange}
        options={options}
      />
    );
  }
}
export default connect(
  (state, { gender }) => ({
    persons: getAllPersons(state).filter(person => (gender ? person.gender === gender : true))
  }),
  {
    searchPersonByName
  }
)(SearchPerson);
