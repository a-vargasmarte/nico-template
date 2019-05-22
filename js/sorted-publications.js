d3.json(
  "data/timeline.json",
  data => {
    console.log(data);
    // ({ name: letter, value: +frequency });

    x = d3
      .scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.left, width - margin.right]);
    //   .padding(0.1);

    y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    xAxis = g =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    yAxis = g =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    let height = 500;

    let margin = { top: 20, right: 0, bottom: 30, left: 40 };

    switch (order) {
      case "name-ascending":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "value-ascending":
        data.sort((a, b) => a.value - b.value);
        break;
      case "value-descending":
        data.sort((a, b) => b.value - a.value);
        break;
    }
    x.domain(data.map(d => d.name));
    chart.update();
    return order;
  }
);

function chart() {
  const svg = d3.select("#publications-timeline");

  const bar = svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .style("mix-blend-mode", "multiply")
    .attr("x", d => x(d.name))
    .attr("y", d => y(d.value))
    .attr("height", d => y(0) - y(d.value))
    .attr("width", x.bandwidth());

  const gx = svg.append("g").call(xAxis);

  const gy = svg.append("g").call(yAxis);

  svg.node().update = () => {
    const t = svg.transition().duration(750);

    bar
      .data(data, d => d.name)
      .order()
      .transition(t)
      .delay((d, i) => i * 20)
      .attr("x", d => x(d.name));

    gx.transition(t)
      .call(xAxis)
      .selectAll(".tick")
      .delay((d, i) => i * 20);
  };

  return svg.node();
}
