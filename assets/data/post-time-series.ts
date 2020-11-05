export const postTimeSeries = [
    {
        "accountCode": "PCM",
        "propertyName": "SignalId",
        "propertyValue": "cb69d6e2-596a-4399-bd5a-36b29c008cb8, fa7b422d-2018-4fdb-ba50-0b4be9bf2735",
        "measuredValue": "SignalValue",
        "fromDateTime": "2018-11-18T20:16:43.863Z",
        "toDateTime": "2019-11-18T20:16:43.863Z",
        "environmentFqdn": "41075d1a-97a6-4f2d-9abb-a1c08be5b6c4.env.timeseries.azure.com",
        "bucketSize": "1h"
    }
]



// Get TimeSeries Data:   /v1/TimeSeries/GetTimeSeriesAggregateMultipleDevices
// {
//     "accountCode": "PCM", ---- Hard Coded
//    "propertyName": "SignalId", ---- Hard Coded
//    "propertyValue": "cb69d6e2-596a-4399-bd5a-36b29c008cb8, fa7b422d-2018-4fdb-ba50-0b4be9bf2735", --- Dynamically 
//    "measuredValue": "SignalValue", ---- Hard Coded
//    "fromDateTime": "2018-11-18T20:16:43.863Z", ---- Hard Coded
//    "toDateTime": "2019-11-18T20:16:43.863Z", ---- Hard Coded
//    "environmentFqdn": "41075d1a-97a6-4f2d-9abb-a1c08be5b6c4.env.timeseries.azure.com", ---- Hard Coded
//    "bucketSize": "1h" ---- Hard Coded
//   }

// Signals to Show
// FA7B422D-2018-4FDB-BA50-0B4BE9BF2735    signal
// CB69D6E2-596A-4399-BD5A-36B29C008CB8    humidity
// E9326142-068B-494B-BFF7-421A44FA0CAE    Battery
// 71FE01AE-141C-463F-8E5C-5C40EE02E533    Temperature
// 4064C563-FC11-4CF8-A7B7-94CE998117EF    Gauge Pressure

// Get List of Signal's by Organization: /v1/SignalAssociatedwithAssetLocationByOrganization/{organizationId}