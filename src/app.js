import React from "react"
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import * as d3 from "d3";

import Layout from "./components/Layout";
import "../src/styles/common.less"
import initStore from "./initStore";
import data from "../data/data.json";
import "./styles/D3Tree.less";

ReactDOM.render(
    <Provider store={initStore()}>
        <Layout/>
    </Provider>,
    document.getElementById("root")
);

const getUserById = (id) => data.find(user => user.id === id);

const buildTree = (id) => {
    if (id !== null) {
        let user = getUserById(id);
        let parents = [buildTree(user.father, name), buildTree(user.mother, name)];
        return {
            "name": user.id,
            "children": parents.filter(n => n)
        };
    }
    return null;
};


let treeData = buildTree(7);
//console.log(treeData);
let margin = {top: 60, right: 200, left: 200},
    width = 600 + margin.left + margin.right,
    height = 650 + margin.top;

// declares a tree layout and assigns the size
let treemap = d3.tree()
    .size([500, 350]); //розміщення відносно svg

//  assigns the data to a hierarchy using parent-child relationships
let nodes = d3.hierarchy(treeData);

// maps the node data to the tree layout
nodes = treemap(nodes);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height),
    g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


// adds the links between the nodes
let link = g.selectAll(".link")
    .data( nodes.descendants().slice(1))
    .enter().append("path")
    .attr("class", "link")
    .attr("d", function(d) {
        return "M" + d.x + "," + d.y
            + "C" + d.x + "," + (d.y + d.parent.y) / 2
            + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
            + " " + d.parent.x + "," + d.parent.y;              
    });

// adds each node as a group
let node = g.selectAll(".node")
    .data(nodes.descendants())
    .enter().append("g")
    .attr("class", function(d) {
        return "node" +
            (d.children ? " node--internal" : " node--leaf"); })
    .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; });

// adds the circle to the node
node.append("rect")
    .attr("width", 100)
    .attr("height", 150)
    .style("fill", "#fff");

// adds the text to the node
node.append("text")
    .attr("dy", ".35em")
    .attr("y", function(d) { return d.children ? -20 : 20; })
    .style("text-anchor", "middle")
    .text(function(d) { return d.data.name; });