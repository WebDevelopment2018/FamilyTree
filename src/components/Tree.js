import React, { Component } from "react"
import * as d3 from "d3"
import { connect } from "react-redux"
import { makeDraggable, moveElement, stopMoving } from "../helpers/drugAndDrop"

import "../styles/Tree.scss"
import block from "../helpers/BEM"
import Family from "./Family"
import { fetchUserFamily } from "../actions/fetching"
import { getFamilyByPersonId, isFamilyFetching } from "../reducers"
import TreePathes from "./TreePathes"

const b = block("Tree")

class Tree extends Component {
  constructor(props) {
    super(props)
    this.state = {
      parentsCoordinates: [],
      childrenCoordinates: [],
      siblingsCoordinates: [],
      relationshipCoordinates: []
    }
  }

  componentWillMount() {
    this.calculateTree(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.calculateTree(nextProps)
  }

  calculateTree(props) {
    const { fetchUserFamily, isFamilyFetching, family, activePersonId } = props
    if (!family && !isFamilyFetching) {
      fetchUserFamily(activePersonId)
    }
    if (family) {
      const parentsNodes = this.initTree(family.parents)
      const parentHeight = parentsNodes.height * 200
      parentsNodes.each(function(d) {
        d.y = parentHeight - d.depth * 200
      })
      const childrenNodes = this.initTree(family.children)

      //Using function rather than => in case of d3.js
      childrenNodes.each(function(d) {
        d.y = parentHeight + 200 * d.depth
      })

      const relationshipCoordinates = family.relationship.map((s, i) => ({
        id: s,
        x: parentsNodes.x - 200 * (i + 1),
        y: parentsNodes.y - 150
      }))

      const siblingsCoordinates = family.siblings.map((s, i) => ({
        id: s,
        x: parentsNodes.x + 200 * (i + 1),
        y: parentsNodes.y - 150
      }))

      this.setState({
        relationshipCoordinates,
        siblingsCoordinates,
        childrenCoordinates: this.buildTree(childrenNodes),
        parentsCoordinates: this.buildTree(parentsNodes)
      })
    }
  }

  initTree(treeData) {
    let treemap = d3.tree().nodeSize([120, 150])
    let nodes = d3.hierarchy(treeData)
    nodes = treemap(nodes)
    return nodes
  }

  buildTree(nodes) {
    let nodesMap = []
    nodes.each(function(d) {
      nodesMap.push({
        id: d.data["name"],
        x: d.x - 50, //control where to start through width of the block
        y: d.y - 150, //control where to start through height of the block
        children: d.children,
        parent: d.parent
      })
    })
    return nodesMap
  }

  render() {
    const all = this.state.relationshipCoordinates.concat(
      this.state.siblingsCoordinates,
      this.state.childrenCoordinates.slice(1, this.state.childrenCoordinates.length),
      this.state.parentsCoordinates
    )
    return (
      <>
        <svg
          onMouseDown={makeDraggable}
          onMouseMove={moveElement}
          onMouseUp={stopMoving}
          ref="root"
          className={b()}
          width="70%"
          height="700"
          key="1"
          transform="matrix(1 0 0 1 0 0)"
        >
          <TreePathes
            parentsCoordinates={this.state.parentsCoordinates}
            childrenCoordinates={this.state.childrenCoordinates}
          />
        </svg>
        <Family coordinates={all} activeId={this.props.activePersonId} key="2" />
      </>
    )
  }
}

export default connect(
  (state, props) => {
    return {
      activePersonId: props.match.params.person,
      family: getFamilyByPersonId(props.match.params.person, state),
      isFamilyFetching: isFamilyFetching(props.match.params.person, state)
    }
  },
  { fetchUserFamily }
)(Tree)
