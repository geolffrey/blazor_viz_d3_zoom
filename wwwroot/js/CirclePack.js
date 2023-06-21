export class CirclePack {
    constructor() {
        this.width = window.innerWidth || 900;
        this.height = window.innerHeight || 500;

        this.zoom = d3.zoom();
        this.zoomed = null;
        this.svg = d3.select('#chart').append('svg');
        this.g = this.svg.append('g').attr("class", "circles");

        this.data = [];

        this.radius = 6;
        this.step = this.radius * 2;
        this.theta = Math.PI * (3 - Math.sqrt(5));
    }

    init() {
        this.zoomed = ({ transform }) => {
            this.g.attr('transform', transform);
        };

        this.zoom.scaleExtent([1, 40]).on('zoom', this.zoomed);

        this.svg
            .attr('viewBox', [0, 0, this.width, this.height])
            .on('click', this.reset);

        this.g
            .append('style')
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

    clicked(event, [x, y]) {
        event.stopPropagation();

        this.svg.transition().duration(2500).call(
            this.zoom.transform,
            d3.zoomIdentity
                .translate(this.width / 2, this.height / 2)
                .scale(40)
                .translate(-x, -y)
        );
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
            this.g.selectAll('circle')
                .data(this.data)
                .join('circle')
                .attr('cx', ([x]) => x)
                .attr('cy', ([_, y]) => y)
                .attr('r', this.radius)
                .attr('fill', (d, i) => d3.interpolateRainbow(i / 360))
                .on('click', this.clicked)
                .append('title').text((d, i) => `circle ${i}`);

            this.svg.call(this.zoom);
        }
    }

    get dataSet() {
        return this.data;
    }
    set dataSet(value) {
        if (value > 0) {
            this.data = Array.from({ length: value }, (_, i) => {
                const radius = this.step * Math.sqrt(i += 0.5)
                const a = this.theta * i;
                return [
                    this.width / 2 + radius * Math.cos(a),
                    this.height / 2 + radius * Math.sin(a)
                ];
            });

            this.update()
            this.reset();
        }
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
