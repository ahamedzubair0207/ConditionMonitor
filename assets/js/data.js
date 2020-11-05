// function to set data in static html files - dashboard files
export function setData(data) {
    document.getElementById('world').innerHTML = data;
}

export function setDashboardConfiguration() {
    alert("hello callled--"+document.getElementById('type_of_data').value);
    return document.getElementById('type_of_data').value;
}

// $(document).ready(function() {
//     function setDashboardConfiguration() {
//         alert("fucntion called");
//     }
//     $("#dashboard_config_btncreate").click(setDashboardConfiguration);
// });