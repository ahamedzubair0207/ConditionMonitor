import { Component, OnInit, NgZone } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);
@Component({
  selector: 'app-votm-pictorial-chart',
  templateUrl: './votm-pictorial-chart.component.html',
  styleUrls: ['./votm-pictorial-chart.component.scss']
})
export class VotmPictorialChartComponent implements OnInit {

  private chart: am4charts.SlicedChart;
  id: any;

  constructor(private zone: NgZone) {
    this.id = Math.floor((Math.random() * 100) + 1);
   }

  ngOnInit() {
  }

  ngAfterViewInit() {
    am4core.options.commercialLicense = true;
    hideCredits: true;
    var iconPath = "M53.5,476c0,14,6.833,21,20.5,21s20.5-7,20.5-21V287h21v189c0,14,6.834,21,20.5,21 c13.667,0,20.5-7,20.5-21V154h10v116c0,7.334,2.5,12.667,7.5,16s10.167,3.333,15.5,0s8-8.667,8-16V145c0-13.334-4.5-23.667-13.5-31 s-21.5-11-37.5-11h-82c-15.333,0-27.833,3.333-37.5,10s-14.5,17-14.5,31v133c0,6,2.667,10.333,8,13s10.5,2.667,15.5,0s7.5-7,7.5-13 V154h10V476 M61.5,42.5c0,11.667,4.167,21.667,12.5,30S92.333,85,104,85s21.667-4.167,30-12.5S146.5,54,146.5,42 c0-11.335-4.167-21.168-12.5-29.5C125.667,4.167,115.667,0,104,0S82.333,4.167,74,12.5S61.5,30.833,61.5,42.5z";
   
    let chart = am4core.create("chartdiv-pictorial-"+this.id, am4charts.SlicedChart);
    chart.titles.create().text = "KO chance";

    chart.data = [{
        "name": "The first",
        "value": 254
    }, {
        "name": "The second",
        "value": 245
    }, {
        "name": "The third",
        "value": 187
    }, {
        "name": "The fourth",
        "value": 123
    }, {
        "name": "The fifth",
        "value": 87
    }, {
        "name": "The sixth",
        "value": 45
    }, {
        "name": "The seventh",
        "value": 23
    }];
    
    var series = chart.series.push(new am4charts.PictorialStackedSeries());
    series.dataFields.value = "value";
    series.dataFields.category = "name";
    series.alignLabels = true;
    
    series.maskSprite.path = iconPath;
    series.ticks.template.locationX = 1;
    series.ticks.template.locationY = 0.5;
    
    series.labelsContainer.width = 200;
    
  
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

}


