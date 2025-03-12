function createNetwork(nodes, edges) {
  const network = {};

  nodes.forEach((node) => {
    if (node.direction === "upstream" || node.direction === "downstream") {
      network[node.id] = {
        id: node.id,
        upstream: [],
        downstream: [],
        color: node.direction === "upstream" ? "blue" : "green",
      };
    } else {
      console.warn(`Invalid node: ${JSON.stringify(node)}`);
    }
  });

  edges.forEach((edge) => {
    const sourceNode = network[edge.source];
    const targetNode = network[edge.target];
    if (sourceNode && targetNode) {
      sourceNode.downstream.push(targetNode.id);
      targetNode.upstream.push(sourceNode.id);
    } else {
      console.warn(`Invalid edge: ${JSON.stringify(edge)}`);
    }
  });

  function buildXML(node, parentElement, visited = new Set()) {
    const uniqueVisitKey = `${node.id}_${parentElement.nodeName}`;
    if (visited.has(uniqueVisitKey)) return;
    visited.add(uniqueVisitKey);

    const nodeElement = document.createElement("node");
    nodeElement.setAttribute("id", node.id);
    nodeElement.setAttribute("color", node.color);

    if (node.upstream.length > 0) {
      const upstreamElement = document.createElement("upstream");
      node.upstream.forEach((upstreamId) => {
        const upstreamNode = network[upstreamId];
        if (upstreamNode) {
          buildXML(upstreamNode, upstreamElement, visited);
        }
      });
      nodeElement.appendChild(upstreamElement);
    }

    if (node.downstream.length > 0) {
      const downstreamElement = document.createElement("downstream");
      node.downstream.forEach((downstreamId) => {
        const downstreamNode = network[downstreamId];
        if (downstreamNode) {
          buildXML(downstreamNode, downstreamElement, visited);
        }
      });
      nodeElement.appendChild(downstreamElement);
    }

    parentElement.appendChild(nodeElement);
  }

  const rootNodes = Object.values(network).filter((node) => node.upstream.length === 0);
  const xmlDoc = document.implementation.createDocument(null, "network");
  rootNodes.forEach((rootNode) => buildXML(rootNode, xmlDoc.documentElement));

  return new XMLSerializer().serializeToString(xmlDoc);
}

module.exports = {
  createNetwork,
};
