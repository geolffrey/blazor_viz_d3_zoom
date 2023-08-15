export class CirclePack {
    constructor() {
        this.width = 900;
        this.height = 600;

        this.callBack = null;
        this.zoom = null;
        this.handleZoom = null;
        this.svg = null;
        this.g = null;

        this.data = null;

        this.radius = 6;       // r - radius for the dot circunference
    }

    init() {
        this.data = []

        this.zoom = d3.zoom();                      // zooming func-object behavoir, manage all the geometry/math for zooming functionalities. when you create this object, think on I WILL ZOOM.

        this.handleZoom = ({ transform }) => {      // a promise to handle the zooming, think on HOW THE ZOOM WILL BE DONE, in this case we pass the object since 
            this.g.attr('transform', transform);    // this will be passed as parameter by the functions zoomIn,zoomOut,zoomRandom,zoomReset. 
        };

        this.zoom.scaleExtent([1, 40])
            .on('zoom', this.handleZoom); // define the type of zoom and link it to the zoom handler

        this.svg = d3.select('#chart')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('svg');               // find the container and create the SVG 

        this.svg.attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", [0, 0, this.width, this.height])
            .classed("svg-content", true)
            .on('click', this.reset);

        this.g = this.svg.append('g').attr("class", "circles"); // 

        this.g.append('style')
            .text(`
                .circles {
                    stroke: transparent;
                    stroke-width: .5px;
                }
                .circles circle:hover {
                    stroke: orangered;
                }
              `);

        this.update();
    }

    zoomIn() {
        this.svg.transition().call(this.zoom.scaleBy, 2);
    }

    zoomOut() {
        this.svg.transition().call(this.zoom.scaleBy, 0.5);
    }

    zoomRandom() {
        this.random();
    }

    zoomReset() {
        this.reset();
    }

    random() {
        const [x, y] = this.data[Math.floor(Math.random() * this.data.length)];
        this.svg.transition().duration(2500).call(
            this.zoom.transform,
            d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(40).translate(-x, -y)
        );
    }

    reset() {
        this.svg
            .transition()
            .duration(750)
            .call(this.zoom.transform,
                d3.zoomIdentity,
                d3.zoomTransform(this.svg.node())
                    .invert([this.width / 2, this.height / 2])
            );
    }

    update() {
        if (this.data.length > 0) {

            const clicked = (event, [x, y]) => {
                event.stopPropagation();

                this.svg.transition().duration(2500).call(
                    this.zoom.transform,
                    d3.zoomIdentity
                        .translate(this.width / 2, this.height / 2)
                        .scale(40)
                        .translate(-x, -y)
                );

                if (typeof this.callBack === 'function') {
                    var element = document.getElementById(`${event.currentTarget.id}`);
                    this.callBack({ "Id": element.id , "Name": "Dot", "Count": "123", "Path": `${element.getAttribute('fill')}` });
                }
            }

            this.g.selectAll('circle')
                .data(this.data)
                .join('circle')
                .attr('cx', ([x]) => x)
                .attr('cy', ([_, y]) => y)
                .attr('r', this.radius)
                .attr('fill', (d, i) => d3.interpolateRainbow(i / 360))
                .attr('id', (d, i) => `ID${i}`)
                .on('click', clicked)
                .append('title').text((d, i) => `circle ${i}`);

            this.svg.call(this.zoom);
        }
    }

    addDataSet(dataset) {
        this.data = dataset;

        this.update();
        this.reset();
    }
    get dataSet() {
        return this.data;
    }

    // Setting dot quantity and generating dots
    set dataSet(value) {
        this.data = dataset;

        this.update();
        this.reset();
    }

    set setCallBack(callback) {
        this.callBack = callback;
    }

    dispose() {
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                const value = this[key];

                // Recursively call dispose() if possible.
                if (value && typeof value.dispose === 'function') {
                    value.dispose();
                }

                // Remove any reference.
                delete this[key];
            }
        }
    };
};
