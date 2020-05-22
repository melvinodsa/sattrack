import React from "react";
import echarts from "echarts";
import "echarts/map/js/world";
import "./App.css";

class App extends React.Component {
  options = {
    backgroundColor: new echarts.graphic.RadialGradient(0.5, 0.5, 0.4, [
      {
        offset: 0,
        color: "#4b5769",
      },
      {
        offset: 1,
        color: "#404a59",
      },
    ]),
    title: {
      text: "Satllite location",
      subtext: "data from open notify",
      sublink: "http://open-notify.org/Open-Notify-API/ISS-Location-Now/",
      left: "center",
      top: 5,
      itemGap: 0,
      textStyle: {
        color: "#eee",
      },
      z: 200,
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        var value = params.value[0] + " , " + params.value[1];
        return (
          params.name +
          " : " +
          value +
          "<br/>" +
          "Last updated at : " +
          new Date(params.value[2] * 1000)
        );
      },
    },
    brush: {
      geoIndex: 0,
      brushLink: "all",
      inBrush: {
        opacity: 1,
        symbolSize: 14,
      },
      outOfBrush: {
        color: "#000",
        opacity: 0.2,
      },
      z: 10,
    },
    geo: {
      map: "world",
      silent: true,
      emphasis: {
        label: {
          show: false,
          areaColor: "#eee",
        },
      },
      itemStyle: {
        borderWidth: 0.2,
        borderColor: "#404a59",
      },
      roam: true,
    },
    series: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      result: { iss_position: { longitude: 0, latitude: 0 } },
      chartInstance: undefined,
      myLocation: {},
    };
  }

  reorganizehartData() {
    this.options.series = [
      {
        type: "scatter",
        coordinateSystem: "geo",
        symbolSize: 8,
        data: [
          {
            name: "ISS Location",
            value: [
              this.state.result.iss_position.longitude,
              this.state.result.iss_position.latitude,
              this.state.result.timestamp,
            ],
          },
          {
            name: "My Location",
            value: [
              this.state.myLocation.longitude,
              this.state.myLocation.latitude,
              this.state.myLocation.timestamp,
            ],
          },
        ],
        activeOpacity: 1,
        label: {
          formatter: "{b}",
          position: "right",
          show: false,
        },
        symbolSize: 30,
        itemStyle: {
          borderColor: "#fff",
          color: "#577ceb",
        },
        emphasis: {
          label: {
            show: true,
          },
        },
      },
    ];
    this.state.chartInstance.setOption(this.options);
  }

  fetchData() {
    fetch("https://sheltered-spire-38600.herokuapp.com/iss-now.json")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState(
            Object.assign({}, this.state, {
              isLoaded: true,
              result,
            })
          );
          this.reorganizehartData();
        },
        (error) => {
          this.setState(
            Object.assign({}, this.state, {
              isLoaded: true,
              error,
            })
          );
        }
      );
  }

  getMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState(
          Object.assign({}, this.state, {
            myLocation: {
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
              timestamp: position.timestamp,
            },
          })
        );
      });
    }
  }

  componentDidMount() {
    this.getMyLocation();
    this.fetchData();
    setInterval(this.fetchData.bind(this), 5000);
    this.setState(
      Object.assign({}, this.state, {
        chartInstance: echarts.init(document.getElementById("main")),
      })
    );
  }

  render() {
    return (
      <div>
        <div style={{ width: "100%", height: "100%" }}>
          <div id="main" style={{ height: "100vh" }}></div>
        </div>
      </div>
    );
  }
}

export default App;
