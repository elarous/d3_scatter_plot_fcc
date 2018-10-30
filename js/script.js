document.addEventListener("DOMContentLoaded",() => {
    let req = new XMLHttpRequest();
    req.open("GET","https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json",true);
    req.setRequestHeader("Content-Type","text/plain");
    req.onreadystatechange = () => {
        if (req.readyState == 4 && req.status == 200){
            const json = JSON.parse(req.responseText);
            makeChart(json);
        }
    };
    req.send();
});

function makeChart(dataset){
    const h = 400;
    const w = 800;
    const padding = 50;

    const timeYearData = dataset.map((d) => {
        const timeParts = d.Time.split(":").map((t) => parseInt(t));
        let time = new Date(1970,1,1);
        time.setMinutes(timeParts[0]);
        time.setSeconds(timeParts[1]);
        const year = d.Year;
        return Object.assign(d,{Time: time,Year: year});
    });


    let minYear = d3.min(timeYearData, (d) => d.Year) - 1;
    let maxYear = d3.max(timeYearData, (d) => d.Year) + 1;
    const minTime = d3.min(timeYearData, (d) => d.Time);
    const maxTime = d3.max(timeYearData, (d) => d.Time);

    const xScale = d3.scaleLinear()
          .domain([minYear,maxYear])
          .range([padding, w - padding]);

    const yScale = d3.scaleTime()
          .domain([minTime,maxTime])
          .range([padding, h - padding]);

    const xAxisScale = d3.scaleLinear()
          .domain([minYear,maxYear])
          .range([padding, w - padding]);

    const yAxisScale = d3.scaleTime()
          .domain([minTime,maxTime])
          .range([padding,h - padding]);

    const colorScale = d3.scaleOrdinal(d3.schemeSet1);

    const xAxis = d3.axisBottom(xAxisScale)
          .tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yAxisScale)
          .tickFormat(d3.timeFormat("%M:%S"));

    let tooltip = d3.select("#container")
        .append("div")
        .attr("id","tooltip");

    let svg = d3.select("#container")
        .append("svg")
        .attr("height",h)
        .attr("width",w);

    svg.selectAll("circle")
        .data(timeYearData)
        .enter()
        .append("circle")
        .attr("class","dot")
        .attr("data-xvalue",(d) => d.Year)
        .attr("data-yvalue",(d) => d.Time)
        .attr("r",5)
        .attr("cx",(d) => xScale(d.Year))
        .attr("cy",(d) => yScale(d.Time))
        .attr("fill",(d) => colorScale(d.Doping != ""))
        .on("mouseover", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity",1)
                .style("left",xScale(d.Year) + 10 +"px")
                .style("top", yScale(d.Time) + 10+"px");
            tooltip.attr("data-year",d.Year)
                .html('<div class="name">'+d.Name+'</div>'
                      +'<div class="nationality">'+d.Nationality+'</div>'
                      +'<div class="year">'+d.Year+'</div>'
                      +'<div class="time">'+d3.timeFormat("%M:%S")(d.Time)+'</div>'
                      +'<div class="doping">'+d.Doping+'</div>');
        })
        .on("mouseout", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity","0");
            tooltip
        });

    


    svg.append("g")
        .attr("id","x-axis")
        .attr("transform","translate(0,"+(h - padding)+")")
        .call(xAxis);

    svg.append("g")
        .attr("id","y-axis")
        .attr("transform","translate("+padding+",0)")
        .call(yAxis);

    let legend = svg.append("g")
        .attr("id","legend")
        .attr("transform","translate("+(w - (padding + 160))+","+(h - padding) / 2+")");

    let legendDoping = legend.append("g");
    legendDoping.append("text")
        .text("Riders With Doping Allegations")
        .attr("font-size","14px")
        .attr("transform","translate(-45,0)");
    legendDoping.append("rect")
        .attr("height",18)
        .attr("width",18)
        .attr("fill",colorScale(true))
        .attr("transform","translate(160,-12)");

    let legendNotDoping = legend.append("g") ;
    legendNotDoping.append("text")
        .text("No Doping Allegations")
        .attr("font-size","14px")
        .attr("transform","translate(12,26)");
    legendNotDoping.append("rect")
        .attr("height",18)
        .attr("width",18)
        .attr("fill",colorScale(false))
        .attr("transform","translate(160,14)");

    svg.append("text")
        .text("Times In Minutes")
        .attr("x",0)
        .attr("y",(h - padding) / 2)
        .attr("transform","rotate(-90,12,"+(h - padding) / 2+")");

    
    }
