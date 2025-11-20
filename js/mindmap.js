class MindMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.layout = 'vertical'; // default
        this.zoom = d3.zoom().scaleExtent([0.1, 2]).on("zoom", (e) => {
            if (this.g) {
                this.g.attr("transform", e.transform);
            }
        });
    }

    render(markdown, layout = 'vertical') {
        if (!markdown) return;
        this.layout = layout;
        this.container.innerHTML = '';

        const data = this.parseMarkdown(markdown);
        if (!data) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight || 600;

        const svg = d3.select(this.container).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .call(this.zoom)
            .on("dblclick.zoom", null);

        this.g = svg.append("g");

        const root = d3.hierarchy(data);

        // Layout Configuration
        const nodeWidth = 260; // Matches CSS max-width
        // const nodeHeight = 100; // Estimated

        let tree;
        let linkGenerator;
        let xSpacing, ySpacing;

        if (this.layout === 'vertical') {
            xSpacing = 320; // Horizontal space between nodes (siblings)
            ySpacing = 250; // Vertical space between levels (depth)
            tree = d3.tree().nodeSize([xSpacing, ySpacing]);

            linkGenerator = d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y);
        } else {
            // Horizontal Layout
            // In D3 Tree:
            // x = coordinate across children (vertical in horizontal layout)
            // y = coordinate across depth (horizontal in horizontal layout)

            xSpacing = 200; // Vertical space between nodes (siblings) - needs to fit card height
            ySpacing = 350; // Horizontal space between levels (depth) - needs to fit card width
            tree = d3.tree().nodeSize([xSpacing, ySpacing]);

            linkGenerator = d3.linkHorizontal()
                .x(d => d.y) // Depth is on X axis
                .y(d => d.x); // Breadth is on Y axis
        }

        tree(root);

        // Links
        this.g.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("d", linkGenerator);

        // Nodes
        const nodes = this.g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", d => "node depth-" + d.depth)
            .attr("transform", d => {
                if (this.layout === 'vertical') {
                    return `translate(${d.x},${d.y})`;
                } else {
                    return `translate(${d.y},${d.x})`;
                }
            });

        // ForeignObject for HTML content
        // Adjust positioning based on layout
        let foX, foY;

        if (this.layout === 'vertical') {
            foX = -nodeWidth / 2;
            foY = -20; // Start slightly above the node point?
                       // In vertical, (x,y) is top-center of the node area.
                       // Let's center the card horizontally.
        } else {
            // Horizontal
            // (y, x) is the anchor point (left-center usually for horizontal tree?)
            // d3.tree horizontal: root is at (0,0). Children at (y, x).
            // We want the card to start at y.
            foX = 0; // Start at the anchor point (left)
            foY = -50; // Center vertically? Card height varies.
            // Let's assume a baseline middle alignment.
        }

        // Note: For variable height content, centering vertically in horizontal layout is hard with simple offsets.
        // But let's try to center it roughly.

        nodes.append("foreignObject")
            .attr("width", nodeWidth)
            .attr("height", 400) // Allow tall content
            .attr("x", this.layout === 'vertical' ? -nodeWidth / 2 : 10) // Horizontal: shift right slightly
            .attr("y", this.layout === 'vertical' ? 0 : -40) // Vertical: start at point. Horizontal: move up to center.
            .append("xhtml:div")
            .attr("class", "mm-node-content")
            // For horizontal, we might want left alignment in the foreignObject
            .style("justify-content", this.layout === 'vertical' ? "center" : "flex-start")
            .html(d => `
                <div class="mm-card">
                    ${this.renderContent(d.data.content)}
                </div>
            `);


        // Initial Zoom/Pan
        let initialX, initialY;

        if (this.layout === 'vertical') {
            initialX = width / 2;
            initialY = 50;
        } else {
            initialX = 100;
            initialY = height / 2;
        }

        svg.call(this.zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(0.8));

        if (window.MathJax) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.container]);
        }
    }

    parseMarkdown(markdown) {
        const lines = markdown.split('\n');
        const root = { children: [] };
        const stack = [{ node: root, level: -1 }];
        let lastNode = null;

        lines.forEach(line => {
            if (line.trim() === '') return;

            // Check for Rich Content (line starting with :)
            if (lastNode && line.trim().startsWith(':')) {
                const contentLine = line.trim().substring(1).trim();
                lastNode.content += '\n' + contentLine;
                return;
            }

            let level = 0;
            let content = '';

            // Check for headings #
            const headingMatch = line.match(/^(#+)\s+(.*)/);
            if (headingMatch) {
                level = headingMatch[1].length - 1;
                content = headingMatch[2].trim();
            } else {
                // Check for list items - or *
                const listMatch = line.match(/^(\s*)([-*])\s+(.*)/);
                if (listMatch) {
                    const spaces = listMatch[1].length;
                    level = Math.floor(spaces / 2); // Assume 2 spaces per indent
                    // If mixed with headings, we need a strategy.
                    // Let's assume headings are top levels (0, 1, 2) and lists might be deeper or same.
                    // The user code provided a simple indent parser.
                    content = listMatch[3].trim();
                } else {
                    // Plain text line? Treat as sibling or ignore?
                    // Let's ignore for now to avoid clutter, or treat as level 0 if nothing else?
                    return;
                }
            }

            const newNode = {
                content: content,
                children: []
            };

            // Find parent
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            if (stack.length > 0) {
                stack[stack.length - 1].node.children.push(newNode);
            }

            stack.push({ node: newNode, level: level });
            lastNode = newNode;
        });

        return root.children.length > 0 ? root.children[0] : null;
    }

    renderContent(text) {
        if (typeof marked !== 'undefined') {
            return marked.parse(text);
        }
        return text;
    }
}

window.MindMap = MindMap;
