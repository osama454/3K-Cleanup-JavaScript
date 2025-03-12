function createNetwork(nodes, edges) {
    const nodeMap = new Map();
    for (const node of nodes) {
      const color = node.direction === 'upstream' ? 'blue' : node.direction === 'downstream' ? 'green' : null;
      if (color) {
        nodeMap.set(node.id, { ...node, color });
      }
    }
  
    const xml = [];
    xml.push('<network>');
  
    for (const [id, node] of nodeMap) {
      xml.push(`<node xmlns="http://www.w3.org/1999/xhtml" id="${id}" color="${node.color}">`);
      xml.push(generateChildren(id, nodeMap, edges));
      xml.push('</node>');
    }
    xml.push('</network>');
    return xml.join('');
  }
  
  function generateChildren(nodeId, nodeMap, edges) {
    const xml = [];
    const downstreamEdges = edges.filter(edge => edge.source === nodeId && nodeMap.has(edge.target));
    if (downstreamEdges.length > 0) {
      xml.push('<downstream>');
      for (const edge of downstreamEdges) {
        const targetNode = nodeMap.get(edge.target);
        xml.push(`<node id="${edge.target}" color="${targetNode.color}">`);
        xml.push('<upstream>');
        const upstreamEdges = edges.filter(edge => edge.target === edge.target && nodeMap.has(edge.source));
  
          if(upstreamEdges.length>0){
          for (const edge of upstreamEdges) {
            const sourceNode = nodeMap.get(edge.source);
            xml.push(`<node id="${edge.source}" color="${sourceNode.color}">`);
            xml.push('<downstream>');
            const downstreamEdges2 = edges.filter(edge => edge.source === edge.source && nodeMap.has(edge.target) && edge.target !== nodeId && edge.target !== edge.target);
            for(const edge of downstreamEdges2){
               const targetNode2 = nodeMap.get(edge.target);
                xml.push(`<node id="${edge.target}" color="${targetNode2.color}">`);
                xml.push('<upstream>');
                xml.push('</upstream>');
                xml.push('</node>');
            }
  
            xml.push('</downstream>');
            xml.push('</node>');
  
          }
        }
        else {
          xml.push('</upstream>');
  
        }
  
        xml.push('</upstream>');
        xml.push('</node>');
  
      }
      xml.push('</downstream>');
    }
  
  
    return xml.join('');
  }
  
  module.exports = {
    createNetwork,
  };