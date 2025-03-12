const { createNetwork } = require('./solution.js'); // Adjust the path as necessary

global.console.warn = jest.fn((message)=>{})

describe('createNetwork', () => {
  it('should create a valid XML string from nodes and edges', () => {
    const nodes = [
      { id: 'A', direction: 'upstream' },
      { id: 'B', direction: 'downstream' },
      { id: 'C', direction: 'upstream' }
    ];
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' }
    ];

    const xmlString = createNetwork(nodes, edges);
    expect(xmlString).toContain('<network>');
    expect(xmlString).toContain('<network><node xmlns=\"http://www.w3.org/1999/xhtml\" id=\"A\" color=\"blue\"><downstream><node id=\"B\" color=\"green\"><upstream><node id=\"A\" color=\"blue\"><downstream><node id=\"C\" color=\"blue\"><upstream></upstream></node></downstream></node></upstream></node></downstream></node></network>');
    expect(xmlString).toContain('<network><node xmlns=\"http://www.w3.org/1999/xhtml\" id=\"A\" color=\"blue\"><downstream><node id=\"B\" color=\"green\"><upstream><node id=\"A\" color=\"blue\"><downstream><node id=\"C\" color=\"blue\"><upstream></upstream></node></downstream></node></upstream></node></downstream></node></network>');
    expect(xmlString).toContain('<network><node xmlns=\"http://www.w3.org/1999/xhtml\" id=\"A\" color=\"blue\"><downstream><node id=\"B\" color=\"green\"><upstream><node id=\"A\" color=\"blue\"><downstream><node id=\"C\" color=\"blue\"><upstream></upstream></node></downstream></node></upstream></node></downstream></node></network>');
  });

  it('should ignore invalid nodes and edges', () => {
    const nodes = [
      { id: 'A', direction: 'upstream' },
      { id: 'D', direction: 'invalid' }
    ];
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'X', target: 'Y' }
    ];

    const xmlString = createNetwork(nodes, edges);
    expect(xmlString).toContain('<network>');
    expect(xmlString).toContain('<network><node xmlns=\"http://www.w3.org/1999/xhtml\" id=\"A\" color=\"blue\"></node></network>');
    expect(xmlString).not.toContain('<node id="B"'); // B should not be present
  });

  it('should handle nodes with no edges correctly', () => {
    const nodes = [
      { id: 'A', direction: 'upstream' },
      { id: 'B', direction: 'downstream' }
    ];
    const edges = []; // no edges

    const xmlString = createNetwork(nodes, edges);
    expect(xmlString).toContain('<network>');
    expect(xmlString).toContain('<network><node xmlns=\"http://www.w3.org/1999/xhtml\" id=\"A\" color=\"blue\"></node><node xmlns=\"http://www.w3.org/1999/xhtml\" id=\"B\" color=\"green\"></node></network>');
    expect(xmlString).toContain('<network><node xmlns=\"http://www.w3.org/1999/xhtml\" id=\"A\" color=\"blue\"></node><node xmlns=\"http://www.w3.org/1999/xhtml\" id=\"B\" color=\"green\"></node></network>');
  });

  it('should not include nodes that are invalid', () => {
    const nodes = [
      { id: 'A', direction: 'upstream' },
      { id: 'B', direction: 'downstream' },
      { id: 'C', direction: 'invalid' }
    ];
    const edges = [
      { source: 'A', target: 'B' }
    ];

    const xmlString = createNetwork(nodes, edges);
    expect(xmlString).toContain('<network>');
    expect(xmlString).toContain('<node id="A" color="blue">');
    expect(xmlString).toContain('<node id="B" color="green">');
    expect(xmlString).not.toContain('<node id="C"'); // C should not be present
  });
});