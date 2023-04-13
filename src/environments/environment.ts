// The file for the current environment will overwrite this one during build
// Different environments can be found in config/environment.{dev|prod}.ts
// The build system defaults to the dev environment

export const environment = {
  production: false,
  analyticsUrl: "https://geektalent-analytics-api.azurewebsites.net/",
  // analyticsUrl: "http://localhost:5200", //Python - solr-realtime-analytics
  descriptionsUrl: "https://descriptionserver-dot-datascience-1064.appspot.com/api/",
  apiUrl: "https://geektalent-insight-api-dev.azurewebsites.net",
  // apiUrl: "https://localhost:44300", //CS - GeekTalentInsightsAPI
  // apiUrl: "http://127.0.0.1:44300",
  // localJobsApiUrl: "https://geektalent-jobdata-api-dev.azurewebsites.net"
  localJobsApiUrl: "https://jobdataserver-dot-datascience-1064.appspot.com"
  // localJobsApiUrl: "http://localhost:8081" //Python - GeekTalentDB
};
  